<?php

namespace Tests\Feature\Phone;

use App\Models\Phone\Phone;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class PhoneControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->clearDatabase();
    }
    


    protected function clearDatabase(): void
    {
        DB::connection('mongodb')->getMongoClient()
            ->selectDatabase(config('database.connections.mongodb.database'))
            ->drop();
    }

    
    
    public function it_can_list_phones()
    {
        Phone::insert([
            'user_id' => "option1",
            'team_id' => "option1",
            'department_id' => "option1",
        ]);

        $response = $this->getJson(route('phone.index'));

        $response->assertOk();
    }

    

    public function it_can_create_a_phone()
    {
        $data = [
            'user_id' => "option1",
            'team_id' => "option1",
            'department_id' => "option1",
        ];

        $response = $this->postJson(route('phone.store'), $data);
        
        $response->assertOk();
        $this->assertDatabaseHas((new Phone())->getTable(), array_filter($data, fn($v) => $v !== null));
    }

    
    
    public function it_can_show_a_phone()
    {
        $phone = Phone::create([
            'user_id' => "option1",
            'team_id' => "option1",
            'department_id' => "option1",
        ]);

        $response = $this->getJson(route('phone.show', (string) $phone->id));

        $response->assertOk();
        $response->assertJsonFragment(array_filter([
            'user_id' => "option1",
            'team_id' => "option1",
            'department_id' => "option1",
        ], fn($v) => $v !== null));
    }

    
    
    public function it_can_update_a_phone()
    {
        $phone = Phone::create([
            'user_id' => "option1",
            'team_id' => "option1",
            'department_id' => "option1",
        ]);
        
        $data = [
            'user_id' => "option2",
            'team_id' => "option2",
            'department_id' => "option2",
        ];

        $response = $this->putJson(route('phone.update', (string) $phone->id), $data);

        $response->assertOk();
        $this->assertDatabaseHas((new Phone())->getTable(), array_merge(
            ['_id' => $phone->id],
            array_filter($data, fn($v) => $v !== null)
        ));
    }

    
    
    public function it_can_soft_delete_a_phone()
    {
        $phone = Phone::create([
            'user_id' => "option1",
            'team_id' => "option1",
            'department_id' => "option1",
        ]);

        $response = $this->deleteJson(route('phone.destroy', (string) $phone->id));

        $response->assertOk();
        $this->assertSoftDeleted((new Phone())->getTable(), [
            '_id' => $phone->id,
        ]);
    }

    

    public function it_can_force_delete_a_phone()
    {
        $phone = Phone::create([
            'user_id' => "option1",
            'team_id' => "option1",
            'department_id' => "option1",
        ]);
        
        $phone->delete();

        $phone->forceDelete();

        $this->assertDatabaseMissing((new Phone())->getTable(), [
            '_id' => $phone->id,
        ]);
    }
}