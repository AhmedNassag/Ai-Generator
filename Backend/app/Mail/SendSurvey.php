<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendSurvey extends Mailable
{
    use Queueable, SerializesModels;
    protected $data;
    protected $contact;
    protected $baseurl;

    /**
     * Create a new message instance.
     */
    public function __construct($data, $contact, $baseurl = null)
    {
        //
        $this->data = $data;
        $this->contact = $contact;
        $this->baseurl = $baseurl;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $data = $this->data;
        $contact = $this->contact;
        $baseurl = $this->baseurl;
        return $this->markdown('survey_mail', compact('data', 'contact', 'baseurl'));
    }
}
