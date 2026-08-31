<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Initiate M-Pesa STK Push via Daraja API
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'phone_number'   => 'required|string',
            'amount'         => 'required|numeric|min:1',
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);

        $baseUrl        = config('services.mpesa.base_url');
        $consumerKey    = config('services.mpesa.consumer_key');
        $consumerSecret = config('services.mpesa.consumer_secret');
        $credentials    = base64_encode($consumerKey . ':' . $consumerSecret);

        // 1. Get Access Token dynamically
        $authResponse = Http::withHeaders([
            'Authorization' => 'Basic ' . $credentials,
        ])->get("{$baseUrl}/oauth/v1/generate?grant_type=client_credentials");

        if (!$authResponse->successful()) {
            return response()->json(['message' => 'Failed to obtain M-Pesa access token'], 500);
        }

        $accessToken = $authResponse->json()['access_token'];

        // 2. Prepare STK Push Request
        $shortcode = config('services.mpesa.shortcode', '174379');
        $passkey   = config('services.mpesa.passkey');
        $timestamp = date('YmdHis');
        $password  = base64_encode($shortcode . $passkey . $timestamp);

        $stkResponse = Http::withToken($accessToken)->post("{$baseUrl}/mpesa/stkpush/v1/processrequest", [
            'BusinessShortCode' => $shortcode,
            'Password'          => $password,
            'Timestamp'         => $timestamp,
            'TransactionType'   => 'CustomerPayBillOnline',
            'Amount'            => (int) $request->amount,
            'PartyA'             => $request->phone_number,
            'PartyB'             => $shortcode,
            'PhoneNumber'        => $request->phone_number,
            'CallBackURL'        => config('services.mpesa.callback_url'),
            'AccountReference'   => 'HospitalBooking_' . $appointment->id,
            'TransactionDesc'    => 'Appointment Consultation Fee',
        ]);

        return response()->json($stkResponse->json(), $stkResponse->status());
    }

    public function callback(Request $request)
    {
        $data = $request->all();

        // Log incoming callback payload for debugging
        Log::info('M-Pesa Callback Received:', $data);

        $stkCallback = $data['Body']['stkCallback'] ?? null;

        if (!$stkCallback) {
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Invalid Callback Format'], 400);
        }

        $resultCode = $stkCallback['ResultCode'];
        $resultDesc = $stkCallback['ResultDesc'];
        $checkoutRequestId = $stkCallback['CheckoutRequestID'];

        // Find the associated payment record by CheckoutRequestID
        $payment = Payment::where('checkout_request_id', $checkoutRequestId)->first();

        if (!$payment) {
            Log::error("Payment record not found for CheckoutRequestID: {$checkoutRequestId}");
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if ($resultCode === 0) {
            // Extract M-Pesa Callback Metadata Items
            $metaItems = $stkCallback['CallbackMetadata']['Item'] ?? [];
            $mpesaReceiptNumber = null;

            foreach ($metaItems as $item) { 
                if ($item['Name'] === 'MpesaReceiptNumber') {
                    $mpesaReceiptNumber = $item['Value'];
                    break;
                }
            }

            // Update Payment status to paid
            $payment->update([
                'status' => 'completed',
                'mpesa_receipt_number' => $mpesaReceiptNumber,
                'result_desc' => $resultDesc,
            ]);

            // Update related Appointment status to confirmed
            if ($payment->appointment) {
                $payment->appointment->update([
                    'status' => 'confirmed',
                ]);
            }
        } else {
            // Handle failed, expired, or user-canceled transaction
            $payment->update([
                'status' => 'failed',
                'result_desc' => $resultDesc,
            ]);

            if ($payment->appointment) {
                $payment->appointment->update([
                    'status' => 'payment_failed',
                ]);
            }
        }

        // Always respond with ResultCode 0 so Safaricom stops retrying the webhook
        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Accepted',
        ]);
    }
}
