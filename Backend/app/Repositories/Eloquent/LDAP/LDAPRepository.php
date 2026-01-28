<?php

namespace App\Repositories\Eloquent\LDAP;

use App\Models\LDAP\LDAP;
use App\Repositories\BaseRepository;


 /**
 * LDAPRepository
 *
 * This class is responsible for handling the data operations related to the LDAP model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the LDAP model as its target entity.
 */
class LDAPRepository extends BaseRepository
{
    /**
     * LDAPRepository constructor.
     *
     * Initializes the repository by passing an instance of the LDAP model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with LDAP data.
     */



    public function __construct()
    {
        // Pass a new instance of the LDAP model to the parent BaseRepository constructor
        parent::__construct(new LDAP());
    }

    public function GetConfiguration(){
        $data = LDAP::first();
        return $data;
    }
}
