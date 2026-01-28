<?php

namespace Database\Seeders;

use App\Models\User\User;
use App\Models\Department\Department;
use App\Models\Job\Job;
use App\Models\Color\Color;
use Illuminate\Database\Seeder;

class HierarchySeeder extends Seeder
{
    public function run()
    {
        // Step 1: Create colors
        $color1 = Color::create([
            'name' => 'Red',
            'hexcolor' => '#FF0000',
        ]);

        $color2 = Color::create([
            'name' => 'Green',
            'hexcolor' => '#00FF00',
        ]);

        $color3 = Color::create([
            'name' => 'Blue',
            'hexcolor' => '#0000FF',
        ]);

        $color4 = Color::create([
            'name' => 'Yellow',
            'hexcolor' => '#FFFF00',
        ]);

        // Step 2: Create jobs (these could be your manager, team lead, etc.)
        $job1 = Job::create([
            'name' => 'Manager',
            'code' => 'MGR',
            'description' => 'Responsible for managing a team or department.',
        ]);

        $job2 = Job::create([
            'name' => 'Employee',
            'code' => 'EMP',
            'description' => 'An employee in the department.',
        ]);

        // Step 3: Create top-level departments (HR, IT, etc.)
        $dept1 = Department::create([
            'name' => 'HR',
            'code' => 'HR001',
            'color_id' => $color1->_id,
            'manager_id' => $job1->_id, // Assign the manager job
            'parent_id' => null, // Top-level department
            'job_ids' => [$job1->_id, $job2->_id], // Manager and employee jobs
        ]);

        $dept2 = Department::create([
            'name' => 'IT',
            'code' => 'IT001',
            'color_id' => $color2->_id,
            'manager_id' => $job1->_id, // Assign the manager job
            'parent_id' => null, // Top-level department
            'job_ids' => [$job1->_id, $job2->_id], // Manager and employee jobs
        ]);

        $dept3 = Department::create([
            'name' => 'Development',
            'code' => 'IT002',
            'color_id' => $color3->_id,
            'manager_id' => $job1->_id, // Assign the manager job
            'parent_id' => $dept2->_id, // Child of IT department
            'job_ids' => [$job1->_id, $job2->_id], // Manager and employee jobs
        ]);

        $dept4 = Department::create([
            'name' => 'Design',
            'code' => 'IT003',
            'color_id' => $color4->_id,
            'manager_id' => $job1->_id, // Assign the manager job
            'parent_id' => $dept2->_id, // Child of IT department
            'job_ids' => [$job1->_id, $job2->_id], // Manager and employee jobs
        ]);

        // Step 4: Create nested departments (sub-departments)
        $dept5 = Department::create([
            'name' => 'Web Development',
            'code' => 'IT0021',
            'color_id' => $color3->_id,
            'manager_id' => $job1->_id, // Assign the manager job
            'parent_id' => $dept3->_id, // Child of Development
            'job_ids' => [$job1->_id, $job2->_id], // Manager and employee jobs
        ]);

        $dept6 = Department::create([
            'name' => 'App Development',
            'code' => 'IT0022',
            'color_id' => $color3->_id,
            'manager_id' => $job1->_id, // Assign the manager job
            'parent_id' => $dept3->_id, // Child of Development
            'job_ids' => [$job1->_id, $job2->_id], // Manager and employee jobs
        ]);

        // Step 5: Create users (employees) and assign them to departments
        $user1 = User::create([
            'full_name' => 'Alice Smith',
            'email' => 'alice@example.com',
            'password' => bcrypt('password'),
            'department_id' => $dept1->_id, // HR department
            'job_id' => $job2->_id, // Employee job
            'role_id' => 1,
            'status' => 'active',
        ]);

        $user2 = User::create([
            'full_name' => 'Bob Johnson',
            'email' => 'bob@example.com',
            'password' => bcrypt('password'),
            'department_id' => $dept2->_id, // IT department
            'job_id' => $job2->_id, // Employee job
            'role_id' => 2,
            'status' => 'active',
        ]);

        $user3 = User::create([
            'full_name' => 'Charlie Brown',
            'email' => 'charlie@example.com',
            'password' => bcrypt('password'),
            'department_id' => $dept3->_id, // Development department
            'job_id' => $job2->_id, // Employee job
            'role_id' => 3,
            'status' => 'active',
        ]);

        $user4 = User::create([
            'full_name' => 'David White',
            'email' => 'david@example.com',
            'password' => bcrypt('password'),
            'department_id' => $dept4->_id, // Design department
            'job_id' => $job2->_id, // Employee job
            'role_id' => 4,
            'status' => 'active',
        ]);

        $user5 = User::create([
            'full_name' => 'Eve Black',
            'email' => 'eve@example.com',
            'password' => bcrypt('password'),
            'department_id' => $dept5->_id, // Web Development department
            'job_id' => $job2->_id, // Employee job
            'role_id' => 5,
            'status' => 'active',
        ]);

        $user6 = User::create([
            'full_name' => 'Frank Green',
            'email' => 'frank@example.com',
            'password' => bcrypt('password'),
            'department_id' => $dept6->_id, // App Development department
            'job_id' => $job2->_id, // Employee job
            'role_id' => 6,
            'status' => 'active',
        ]);

        // Step 6: Assign employees to manager
        $dept1->manager()->associate($user1); // Alice is the HR department manager
        $dept2->manager()->associate($user2); // Bob is the IT department manager
        $dept3->manager()->associate($user3); // Charlie is the Development department manager
        $dept4->manager()->associate($user4); // David is the Design department manager
        $dept5->manager()->associate($user5); // Eve is the Web Development department manager
        $dept6->manager()->associate($user6); // Frank is the App Development department manager

        // Step 7: Add the children departments (for example, add 'Development' as a child of 'IT')
        $dept2->children()->save($dept3); // IT has Development as a child department
        $dept2->children()->save($dept4); // IT has Design as a child department
        $dept3->children()->save($dept5); // Development has Web Development as a child
        $dept3->children()->save($dept6); // Development has App Development as a child
    }
}
