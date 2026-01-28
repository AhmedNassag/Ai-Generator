<?php

namespace App\Services\Eloquent\LDAP;

use App\Models\LDAP\LDAP;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\LDAP\LDAPRepository;
use App\Services\Eloquent\Department\DepartmentService;
use Exception;
use LdapRecord\Auth\BindException;
use LdapRecord\Connection;
use LdapRecord\Container;

class LDAPService extends BaseService
{
    protected $ldapRepository;
    protected $connection;
    protected $container;


    public function __construct(LDAPRepository $ldapRepository)
    {
        parent::__construct(new LDAPRepository());
        $this->ldapRepository = $ldapRepository;
    }

    public function TestConnection(Request $request)
    {
        $this->validateData($request);
        try {
            $connection = new Connection([
                'hosts' => explode(',', $request->hosts),
                'port' => $request->port,
                'base_dn' => $request->base_dn,
                'username' => $request->username,
                'password' =>   $request->password,
                // Optional Configuration Options
                'use_ssl'          => ($request->ssl == 'true') ? true : false,
                'use_tls'          => ($request->tls == 'true') ? true : false,
                'version'          => (int)$request->version,
                'timeout'          => (int)$request->timeout,
                'follow_referrals' => ($request->follow == 'true') ? true : false,
            ]);


            $connection->connect();
            $container = Container::addConnection($connection);
            $this->connection = $connection;
            $this->container = $container;
            return true;
        } catch (BindException $e) {
            $error = $e->getDetailedError();
            return "Error: " . $error->getErrorMessage();
        } catch (\Exception $e) {
            return  "Connection Error: " . $e->getMessage();
        }
        return $testConnection;
    }

    public function GetUsers(Request $request)
    {
        $ldapConnection = $this->LdapConnection();
        if ($ldapConnection === true) {
            $excludedOUs = ['Domain Controllers', 'Microsoft Exchange Security Groups'];
            // Initialize an empty array to store the hierarchical tree
            $ouTree = [];

            // Query all users
            $users = $this->connection->query()->where('objectClass', '=', 'user')->get();

            foreach ($users as $user) {
                // Ensure 'distinguishedname' exists for each user
                if (isset($user['distinguishedname'][0])) {
                    $dn = $user['distinguishedname'][0]; // Get the distinguished name
                    $dnParts = explode(',', $dn); // Split the DN into parts

                    // Initialize variables for OU and region
                    $ouHierarchy = []; // Store the OU hierarchy

                    // Iterate through the DN parts to extract all OUs
                    foreach ($dnParts as $part) {
                        if (strpos($part, 'OU=') === 0) {
                            $ou = str_replace('OU=', '', $part); // Extract OU
                            $ouHierarchy[] = $ou; // Add to the hierarchy
                        }
                    }

                    // Extract OUs from the DN
                    preg_match_all('/OU=([^,]+)/', $dn, $matches);

                    if (!empty($matches[1])) {
                        // Reverse to maintain hierarchy from root to leaf
                        $hierarchicalOUs = array_reverse($matches[1]);

                        // Filter out the excluded OUs
                        $hierarchicalOUs = array_filter($hierarchicalOUs, function ($ouName) use ($excludedOUs) {
                            return !in_array($ouName, $excludedOUs);
                        });

                        // Add the OUs to the tree structure only if there are OUs remaining after filtering
                        if (!empty($hierarchicalOUs)) {
                            $currentNode = &$ouTree; // Start from the root of the tree

                            // Loop through the OUs and build the tree structure
                            foreach ($hierarchicalOUs as $ouName) {
                                if (!isset($currentNode[$ouName])) {
                                    $currentNode[$ouName] = []; // Create the OU node if it doesn't exist
                                }
                                $currentNode = &$currentNode[$ouName]; // Move to the next level in the tree
                            }

                            $ldapRegion = null;
                            $components = explode(",", $dn); // Split the DN to find the DC component
                            foreach ($components as $component) {
                                if (strpos($component, "DC=") === 0) {
                                    // Extract the value of the first "DC" component
                                    $ldapRegion = substr($component, 3);
                                    break;
                                }
                            }

                            // Store user data under the final OU
                            $currentNode['users'][] = [
                                'username' => $user['samaccountname'][0],
                                'email' => $user['mail'][0] ?? '',
                                'full_name' => $user['cn'][0],
                                'region' => $ldapRegion ?? 'unknown', // Set a default region if not found
                            ];
                        }
                    }
                }
            }

            // Return the hierarchical tree of users
            return ['status' => true, 'tree' => $ouTree];
        } else {
            return  ['status' => false, 'message' => $ldapConnection];
        }
    }

    public function GetDepartments(Request $request)
    {
        $ldapConnection = $this->LdapConnection();
        if ($ldapConnection === true) {

            $excludedOUs = ['Domain Controllers', 'Microsoft Exchange Security Groups'];

            // Initialize an empty array to store the hierarchical tree
            $tree = [];

            // Query all OUs
            $ous = $this->connection->query()->where('objectClass', '=', 'organizationalUnit')->get();

            foreach ($ous as $ou) {
                $dn = $ou['dn'];



                // Extract the OUs from the DN
                preg_match_all('/OU=([^,]+)/', $dn, $matches);

                if (!empty($matches[1])) {
                    // Reverse to maintain hierarchy from root to leaf
                    $hierarchicalOUs = array_reverse($matches[1]);

                    // Filter out the excluded OUs
                    $hierarchicalOUs = array_filter($hierarchicalOUs, function ($ouName) use ($excludedOUs) {
                        return !in_array($ouName, $excludedOUs);
                    });

                    // Add the OUs to the tree structure only if there are OUs remaining after filtering
                    if (!empty($hierarchicalOUs)) {
                        $currentNode = &$tree;
                        foreach ($hierarchicalOUs as $ouName) {
                            if (!isset($currentNode[$ouName])) {
                                $currentNode[$ouName] = [];
                            }
                            $currentNode = &$currentNode[$ouName];
                        }
                    }
                }
            }
            return ['status' => true, 'tree' => $tree];
        } else {
            return  ['status' => false, 'message' => $ldapConnection];
        }
    }

    public function ImportUsers(Request $request) {}

    public function ImportDepartments($data)
    {

        $errors = [];
        foreach ($data['departments'] as $department) {
            $departmentService = new DepartmentService();
            try {

                $timePart = substr(time(), -7);
                $randomPart = mt_rand(100, 999);

                $departmentData = [
                    'type' => 'LDAP',
                    'code' => $timePart . $randomPart,
                    'name' => $department,
                ];

                // // Create the department
                 $departmentService->create(new Request($departmentData));

            } catch (Exception $e) {

                $errors[] = [
                    'department' => $department,
                    'error' => $e->getMessage(),
                ];
            }
        }

        if(count($errors)){
            return ['status' => false,'errors' =>  $errors];
        }else{
            return ['status' => true];
        }

    }

    public function LdapConnection()
    {
        $configuration =  $this->repository->GetConfiguration();

        $connection = new Connection([
            'hosts' => explode(',',  $configuration->hosts),
            'port' =>  $configuration->port,
            'base_dn' =>   $configuration->base_dn,
            'username' =>   'pk\\' . $configuration->username,
            // 'password' => getLdapValue('LDAP_DEFAULT_PASSWORD'),
            'password' =>  $configuration->password,
            // Optional Configuration Options
            'use_ssl'          => ($configuration->ssl == "true") ? true : false,
            'use_tls'          => ($configuration->tls == "true") ? true : false,
            'version'          => (int)$configuration->version,
            'timeout'          => (int)$configuration->timeout,
            'follow_referrals' => ($configuration->follow == "true") ? true : false,
        ]);

        try {
            $connection->connect();
            $container = Container::addConnection($connection);
            $this->connection = $connection;
            $this->container = $container;
            return true;
        } catch (\LdapRecord\Auth\BindException $e) {
            return $e->getDetailedError()->getErrorMessage();
        }
    }

    public function update($id, $data)
    {
        $this->validateData($data);
        return $this->repository->update($id, $data);
    }

    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            'hosts' => 'required',
            'port' => 'required|integer',
            'base_dn' => 'required',
            'username' => 'required',
            'version' => 'required|integer',
            'timeout' => 'required|integer',
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
}
