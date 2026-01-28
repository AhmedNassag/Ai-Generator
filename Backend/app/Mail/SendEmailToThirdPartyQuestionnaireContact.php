<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendEmailToThirdPartyQuestionnaireContact extends Mailable
{
    use Queueable, SerializesModels;

    protected $data;
    protected $contact;
    protected $note;
    protected $baseurl;


    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($data, $contact,$baseurl = null, $note = null)
    {
        //
        $this->data = $data;
        $this->contact = $contact;
        $this->note = $note;
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
        $note = $this->note;
        $baseurl = $this->baseurl;
        return $this->markdown('mail', compact('data', 'contact', 'note','baseurl'));
    }
}
