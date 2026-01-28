<?php

namespace App\Services\Eloquent\EmailConfig;

use App\Models\EmailConfig\EmailConfig;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\EmailConfig\EmailConfigRepository;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Swift_Mailer;
use Swift_SmtpTransport;
use Illuminate\Support\Facades\Validator;

class EmailConfigService extends BaseService
{

    protected $emailConfigRepository;


    public function __construct()
    {
        $this->emailConfigRepository = new EmailConfigRepository();

        parent::__construct(new EmailConfigRepository());
    }

    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            'email_type' => 'required|string',
            'smtp_server' => 'required|string',
            'smtp_port' => 'required',
            'smtp_username' => 'required|string',
            'smtp_password' => 'required|string',
            'smtp_from_username' => 'required|string',
            'ssl_tls' => 'required|string',
        ];
        $store = [...$validate];
        if ($type == 'store') {
            $request->validate($store);
        }
        if ($type == 'update') {
            $request->validate($validate);
        }
        return $request->all();
    }


    public function create(Request $request)
    {
        try {
            // Validate the data
            $this->validateData($request);

            // Test SMTP connection (throws exception if test fails)
            $this->testSmtpConnection($request);

            // If the test passes, proceed with updating the record
            $data = $request->all();

            // Delegate to the repository to handle database insertion
            return $this->repository->create($data);
        } catch (\Exception $e) {
            // Return a user-friendly message or rethrow the exception
            throw new \Exception('Update Failed: ' . $e->getMessage());
        }
    }


    public function update($id, Request $request)
    {
        try {
            // Validate the data
            $this->validateData($request, 'update');

            // Test SMTP connection (throws exception if test fails)
            $this->testSmtpConnection($request);

            // If the test passes, proceed with updating the record
            $data = $request->all();

            // Delegate to the repository to handle database update
            return $this->repository->update($id, $data);
        } catch (\Exception $e) {
            // Return a user-friendly message or rethrow the exception
            throw new \Exception('Update Failed: ' . $e->getMessage());
        }
    }


    /**
     * Test SMTP connection.
     *
     * @param Request $request
     * @throws \Exception
     */
    private function testSmtpConnection(Request $request)
    {
        try {
            // Configure the SMTP transport
            $transport = new Swift_SmtpTransport($request->smtp_server, $request->smtp_port, $request->ssl_tls);
            $transport->setUsername($request->smtp_username);
            $transport->setPassword($request->smtp_password);

            // Allow self-signed certificates
            $transport->setStreamOptions([
                'ssl' => [
                    'allow_self_signed' => true,
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ]);

            $mailer = new Swift_Mailer($transport);

            // Attempt to connect to the SMTP server
            $mailer->getTransport()->start();
        } catch (\Swift_TransportException $e) {
            // Parse the error message for user-friendly output
            $this->handleSmtpException($e);
        } catch (\Exception $e) {
            // Rethrow general exceptions
            throw new \Exception('SMTP Connection Failed: ' . $e->getMessage());
        }
    }

    /**
     * Handle SMTP exceptions with user-friendly messages.
     *
     * @param \Swift_TransportException $e
     * @throws \Exception
     */
    private function handleSmtpException(\Swift_TransportException $e)
    {
        $errorMessage = $e->getMessage();
        $connectionStatus = match (true) {
            str_contains($errorMessage, 'php_network_getaddresses') => 'SMTP Connection Error: The SMTP server hostname could not be resolved. Please check the server address.',
            str_contains($errorMessage, 'Connection timed out') => 'SMTP Connection Error: The connection to the SMTP server timed out. Please check the server address and port.',
            str_contains($errorMessage, 'Connection refused') => 'SMTP Connection Error: The connection to the SMTP server was refused. Please check the server address, port, and firewall settings.',
            str_contains($errorMessage, 'Failed to authenticate') => 'SMTP Connection Error: Authentication failed. Please check the username and password.',
            str_contains($errorMessage, 'No such host is known') => 'SMTP Connection Error: The SMTP server hostname is invalid or could not be found. Please check the server address.',
            str_contains($errorMessage, 'stream_socket_client') => 'SMTP Connection Error: Unable to establish a connection to the SMTP server. Please check the server address, port, and network settings.',
            str_contains($errorMessage, 'SSL/TLS handshake failed') => 'SMTP Connection Error: The SSL/TLS handshake failed. Please check the SSL/TLS settings and certificate.',
            str_contains($errorMessage, 'AUTH command failed') => 'SMTP Connection Error: The SMTP server rejected the authentication. Please check the username and password.',
            str_contains($errorMessage, 'MAIL FROM command failed') => 'SMTP Connection Error: The SMTP server rejected the sender address. Please check the "From" email address.',
            str_contains($errorMessage, 'RCPT TO command failed') => 'SMTP Connection Error: The SMTP server rejected the recipient address. Please check the "To" email address.',
            str_contains($errorMessage, 'DATA command failed') => 'SMTP Connection Error: The SMTP server rejected the email data. Please check the email content and try again.',
            default => 'SMTP Connection Error: ' . $errorMessage,
        };

        throw new \Exception($connectionStatus);
    }




    public function sendEmailService($data)
    {
        // Decode JSON strings to arrays for validation
        if (isset($data['cc']) && is_string($data['cc'])) {
            $data['cc'] = json_decode($data['cc'], true);
        }
        if (isset($data['bcc']) && is_string($data['bcc'])) {
            $data['bcc'] = json_decode($data['bcc'], true);
        }

        // Define the validation rules
        $rules = [
            'email' => 'required|email',  // Email address must be provided and valid
            'subject' => 'nullable|string',  // Subject is optional but must be a string
            'body' => 'nullable|string',  // Body is optional but must be a string
            'attachments' => 'nullable|array',  // Attachments should be an array
            'attachments.*' => 'file',  // Each attachment must be a file
            'cc' => 'nullable|array',  // CC should be an array
            'cc.*' => 'email',  // Each CC email must be valid
            'bcc' => 'nullable|array',  // BCC should be an array
            'bcc.*' => 'email',  // Each BCC email must be valid
            'replyTo' => 'nullable|email',  // Reply-To must be a valid email address if provided
        ];

        // Validate the data
        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            // If validation fails, throw an exception with the validation errors
            throw new \Exception("Validation failed: " . implode(", ", $validator->errors()->all()));
        }

        // Extract validated values
        $email_to = $data['email'];
        $subject = $data['subject'] ?? 'No Subject';
        $body = $data['body'] ?? 'No Content';
        $attachments = $data['attachments'] ?? [];
        $cc = $data['cc'] ?? [];
        $bcc = $data['bcc'] ?? [];
        $replyTo = $data['replyTo'] ?? null;

        // Get email configuration from the database or any source
        $email_config = $this->emailConfigRepository->sendEmailRepo(); // to get the email setting
        $mail = new PHPMailer(true);  // PHPMailer instance
        $mail->CharSet = 'UTF-8';     // Ensure the correct charset for the email

        try {
            // Set up SMTP configuration
            $mail->isSMTP();
            $mail->SMTPAuth = true;
            $mail->Host = $email_config->smtp_server;
            $mail->Port = $email_config->smtp_port;
            $mail->Username = $email_config->smtp_username;
            $mail->Password = $email_config->smtp_password;
            $mail->SMTPSecure = $email_config->ssl_tls;
            $mail->setFrom($email_config->smtp_from_username, $email_config->smtp_username);

            // Add recipient(s)
            $mail->addAddress($email_to);

            // Add CC and BCC if provided
            if (!empty($cc)) {
                foreach ($cc as $ccEmail) {
                    $mail->addCC($ccEmail);
                }
            }
            if (!empty($bcc)) {
                foreach ($bcc as $bccEmail) {
                    $mail->addBCC($bccEmail);
                }
            }

            // Add Reply-To address if provided
            if ($replyTo) {
                $mail->addReplyTo($replyTo);
            }

            // Set email subject and body
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = strip_tags($body);  // Text version for non-HTML clients

            // Handle attachments if provided
            if (!empty($attachments)) {
                foreach ($attachments as $attachment) {
                    if ($attachment instanceof \Illuminate\Http\UploadedFile) {
                        // Accessing UploadedFile object properties
                        $path = $attachment->getPathName();
                        $name = $attachment->getClientOriginalName();
                        $mail->addAttachment($path, $name);
                    } elseif (is_array($attachment) && isset($attachment['path'])) {
                        $path = $attachment['path'];
                        $name = $attachment['name'] ?? basename($path);
                        if (file_exists($path)) {
                            $mail->addAttachment($path, $name);
                        }
                    } elseif (is_string($attachment) && file_exists($attachment)) {
                        $mail->addAttachment($attachment, basename($attachment));
                    } else {
                        throw new \Exception("Invalid attachment type.");
                    }
                }
            }

            // Additional SMTP options (e.g., disabling certificate verification)
            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ];

            // Send the email
            $mail->send();
        } catch (Exception $e) {
            // Handle exceptions (e.g., connection failure)
            throw new \Exception("Failed to send email: {$e->getMessage()}");
        }

        // return true; // Email sent successfully
    }
}
