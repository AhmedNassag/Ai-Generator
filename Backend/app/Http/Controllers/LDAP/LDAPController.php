<?php

namespace App\Http\Controllers\LDAP;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\LDAP\LDAPService;
use Illuminate\Http\Request;

/**
 * LDAPController Class
 *
 * This controller is responsible for handling all LDAP-related actions, such as creating, reading, updating,
 * and deleting LDAP records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The LDAPController relies on the LDAPService to manage
 * LDAP-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class LDAPController extends BaseController
{
    /**
     * Constructor for LDAPController.
     *
     * Initializes the BaseController with the specific LDAPService instance to ensure that
     * all LDAP-related operations are routed through the appropriate service layer.
     *
     * @param LDAPService $service The service layer responsible for LDAP-specific business logic.
     *
   */
    protected $service;
    public function __construct(LDAPService $service)
    {
        // Pass the LDAPService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
        $this->service = $service;
    }

    public function TestConnection(Request $request){
        $testConnection =  $this->service->TestConnection($request);
        if($testConnection === true)
            return $this->ok('Connection Successful');
        return $this->error(['Connection' => $testConnection]);
    }

    public function GetUsers(Request $request){
        $users =  $this->service->GetUsers($request);
        if($users['status']){
            return $this->success($users['tree'],'Connection Successful');
        }else{
            return $this->error(['Connection' => $users['message']]);
        }
    }

    public function GetDepartments(Request $request){
        $departements =  $this->service->GetDepartments($request);
        if($departements['status']){
            return $this->success($departements['tree'],'Connection Successful');
        }else{
            return $this->error(['Connection' => $departements['message']]);
        }
    }

    public function ImportUsers(Request $request){
        dd($request);
        $importUsers =  $this->service->ImportUsers($request);
    }

    public function ImportDepartments(Request $request){
        $importDepartments =  $this->service->ImportDepartments($request);
        if($importDepartments['status']){
            return $this->ok('Department Import Successful');
        }else{
            return $this->error(['errors' => $importDepartments]);
        }
    }






}



