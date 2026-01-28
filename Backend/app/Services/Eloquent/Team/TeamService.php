<?php

namespace App\Services\Eloquent\Team;

use App\Models\Team\Team;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Team\TeamRepository;
use Illuminate\Support\Facades\Auth;

class TeamService extends BaseService
{
     protected $teamRepository;


     public function __construct(teamRepository $teamRepository)
     {
          $this->teamRepository = $teamRepository;
          parent::__construct($teamRepository);
     }

     public function delete($id)
     {
          $ids = ($id == 0) ? request()->input('recordIds', []) : [$id];

          foreach ($ids as $id) {
               if ($this->teamRepository->isTeamAssignedToUser($id)) {
                    return false;
               }
               $this->repository->delete($id);
               return true;
          }

     }


     public function validateData(Request $request, $type = 'store')
     {
          $validate = [
               'name' => 'unique:teams,name,' . $request->id . ',id,deleted_at,NULL',
          ];

          $store = [
               'name' => 'required|string|max:255|unique:teams,name,' . $request->id . ',id,deleted_at,NULL',
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
