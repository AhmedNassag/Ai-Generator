<?php

namespace App\Services\Eloquent\Hierarchy;

use App\Repositories\Eloquent\Department\DepartmentRepository;
use App\Services\BaseService;
use App\Repositories\Eloquent\Hierarchy\HierarchyRepository;
use App\Repositories\Eloquent\User\UserRepository;
use Illuminate\Support\Facades\Log;

class HierarchyService extends BaseService
{
    protected $hierarchyRepository;
    protected $userRepository;
    protected $departmentRepository;

    public function __construct(HierarchyRepository $hierarchyRepository, DepartmentRepository $departmentRepository, UserRepository $userRepository)
    {
        $this->hierarchyRepository = $hierarchyRepository;
        $this->departmentRepository = $departmentRepository;
        $this->userRepository = $userRepository;

        parent::__construct($hierarchyRepository); // If parent class requires this
    }

    /**
     * Get the structured department and employee hierarchy.
     *
     * @return array
     */


    /**
     * Get the structured department and employee hierarchy.
     *
     * @return array
     */

    public function dragAndDrop($request)
    {
 
        $changes = $request->changes;
        Log::info('Extracted changes.', ['changes' => $changes]);

        $detailedChanges = [];

        foreach ($changes as $change) {
 
            if (!isset($change['id'])) {
                 continue;
            }

            $id = $change['id'];
            $text = $change['text'] ?? 'Unknown';
            $type = $change['type'] ?? 'unknown';
            $oldParentId = $change['oldParentId'] ?? null;
            $newParentId = $change['newParentId'] ?? null;
            $oldParentText = $change['oldParentText'] ?? 'Root';
            $newParentText = $change['newParentText'] ?? 'Root';

            Log::info("Processing {$type} with ID {$id}.", compact('text', 'oldParentId', 'newParentId'));

            if ($type === 'department' && $newParentId && str_starts_with($newParentId, 'E')) {
                 return [
                    'status' => false,
                    'message' => "Cannot move department '{$text}' under an employee.",
                    'notificationCode' => 'DEPARTMENT_UNDER_EMPLOYEE_ERROR',
                ];
            }

            if ($type === 'department') {
                $department = $this->departmentRepository->getDepartments($id);
 
                if ($department) {
                    if ($department->type === 'LDAP') {
                         return [
                            'status' => false,
                            'message' => "Department '{$text}' of type LDAP cannot be moved.",
                            'notificationCode' => 'LDAP_DEPARTMENT_MOVE_ERROR',
                        ];
                    }

                    if ($newParentId) {
                        $newParentDepartment = $this->departmentRepository->getDepartments($newParentId);
 
                        if ($newParentDepartment) {
                            $department->parent_id = $newParentDepartment->id;
                            $department->save();
                             $detailedChanges[] = "Department '{$text}' moved from '{$oldParentText}' to '{$newParentText}'.";
                        }
                    } else {
                        $department->parent_id = null;
                        $department->save();
                         $detailedChanges[] = "Department '{$text}' moved from '{$oldParentText}' to the root level.";
                    }
                }
            }

            if ($type === 'employee') {
                $employee = $this->userRepository->getUser($id);
 
                if ($employee) {
                    if ($employee->type === 'LDAP') {
                         return [
                            'status' => false,
                            'message' => "Employee '{$text}' is managed via LDAP and cannot be moved.",
                            'notificationCode' => 'LDAP_EMPLOYEE_MOVE_ERROR',
                        ];
                    }

                    if ($newParentId) {
                        if (str_starts_with($newParentId, 'E')) {
                             return [
                                'status' => false,
                                'message' => "Employee '{$text}' cannot be moved under another employee.",
                                'notificationCode' => 'EMPLOYEE_UNDER_EMPLOYEE_ERROR',
                            ];
                        }

                        // Fetch the new department
                        $newParentDepartment = $this->departmentRepository->getDepartments($newParentId);
 
                        if ($newParentDepartment) {
                            // **ADD THIS VALIDATION CHECK BEFORE MOVING**
                            $currentEmployeeCount = $this->userRepository->getEmployeeCountByDepartment($newParentDepartment->id);
                            $maxEmployeeLimit = $newParentDepartment->number_of_employees;

                             if ($currentEmployeeCount >= $maxEmployeeLimit) {
                                 return [
                                    'status' => false,
                                    'message' => "Department '{$newParentText}' has reached its maximum employee limit ({$maxEmployeeLimit}).",
                                    'notificationCode' => 'DEPARTMENT_EMPLOYEE_LIMIT_REACHED',
                                ];
                            }

                            // If validation passes, proceed with moving the employee
 
                            $currentJob = $employee->job;
                            $oldDepartmentId = $employee->department_id; // Store old department
                            $oldJobId = $employee->job_id; // Store old job

                            if ($currentJob) {
                                if (!in_array($currentJob->id, $newParentDepartment->job_ids ?? [])) {
                                    $newParentDepartment->push('job_ids', $currentJob->id);
                                }
                                $employee->department_id = $newParentDepartment->id;
                                $employee->job_id = $currentJob->id;
                            } else {
                                $employee->department_id = $newParentDepartment->id;
                            }

                            // Only save if there is an actual change
                            if ($employee->isDirty(['department_id', 'job_id'])) {
                                $employee->save();
                                $detailedChanges[] = "Employee '{$text}' moved from '{$oldParentText}' to '{$newParentText}'.";
                            }  
                        }
                    } else {
                         return [
                            'status' => false,
                            'message' => "Employee '{$text}' cannot be moved outside a department.",
                            'notificationCode' => 'EMPLOYEE_OUTSIDE_DEPARTMENT_ERROR',
                        ];
                    }
                }
            }
        }

        if (!empty($detailedChanges)) {
             return [
                'status' => true,
                'changes' => $detailedChanges,
                'notificationCode' => 'CHANGES_APPLIED_SUCCESS',
            ];
        }

        Log::info('No changes were made.');
        return [
            'status' => true,
            'notificationCode' => 'NO_CHANGES_MADE',
        ];
    }
}
