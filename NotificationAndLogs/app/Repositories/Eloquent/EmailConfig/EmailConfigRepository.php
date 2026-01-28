<?php

namespace App\Repositories\Eloquent\EmailConfig;

use App\Models\EmailConfig\EmailConfig;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\DB;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Swift_Mailer;
use Swift_SmtpTransport;

/**
 * EmailConfigRepository
 *
 * This class is responsible for handling the data operations related to the EmailConfig model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the EmailConfig model as its target entity.
 */
class EmailConfigRepository extends BaseRepository
{
    /**
     * EmailConfigRepository constructor.
     *
     * Initializes the repository by passing an instance of the EmailConfig model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with EmailConfig data.
     */
    public function __construct()
    {
        // Pass a new instance of the EmailConfig model to the parent BaseRepository constructor
        parent::__construct(new EmailConfig());
    }

    // public function create($data = null)
    // {
    //     // Check if 'id' is present in the data
    //     if (isset($data['id'])) {
    //         // Update the existing model
    //         $item = $this->model->find($data['id']);
    //         if ($item) {
    //             $item->update($data);
    //         } else {
    //             // Create a new model
    //             $item = $this->model->create($data);
    //         }
    //     } else {
    //         // Create a new model
    //         $item = $this->model->create($data);
    //     }
    //     return $item;
    // }

    public function sendEmailRepo()
    {
        $emailConfig = EmailConfig::first();

        if (!$emailConfig) {
            throw new \Exception("Email configuration not found.");
        }

        return $emailConfig;
    }

    public function update($id = null, $data = null)
    {
        if (!$data) {
            throw new \Exception('No data provided for update or create.');
        }
    
        // If an ID is provided, attempt to find and update the record
        if ($id) {
            $id = rtrim($id);  // Remove newline characters from the right side only
            $item = $this->model->find($id); // Find the existing item by ID
            
            if ($item) {
                // If item exists, update it with the new data using parent::update
                return parent::update($id, $data);  // Use parent update method
            } else {
                // If no item found, create a new record
                return parent::create($data);  // Use parent create method
            }
        } else {
            // If no ID is provided, create a new record
            return parent::create($data);  // Use parent create method
        }
    }
    
}
