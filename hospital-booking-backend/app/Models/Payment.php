<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'checkout_request_id',
        'payment_method',
        'amount',
        'status',
        'mpesa_receipt_number',
        'result_desc',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}