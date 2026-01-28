<?php

namespace App\Repositories\Eloquent\Team;

use App\Models\Team\Team;
use App\Repositories\BaseRepository;

/**
 * TeamRepository
 *
 * This class is responsible for handling the data operations related to the Team model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Team model as its target entity.
 */
class TeamRepository extends BaseRepository
{
    /**
     * TeamRepository constructor.
     *
     * Initializes the repository by passing an instance of the Team model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Team data.
     */
    public function __construct()
    {
        // Pass a new instance of the Team model to the parent BaseRepository constructor
        parent::__construct(new Team());
    }

    public function isTeamAssignedToUser($teamId): bool
    {
        #return User::where('team_id', $teamId)->exists(); // Old code (i shouldn't call the User model directly in the teamRepository)
        return $this->model->where('id', $teamId)->whereHas('users')->exists();
    }

    public function update($id, $data = null)
    {
        $team = parent::update($id, $data);
        if (isset($data['user_ids'])) {
            $team->users()->attach($data['user_ids']);
        }
        return $team;

    }

}
