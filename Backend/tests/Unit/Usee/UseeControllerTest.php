<?php

namespace Tests\Feature\Usee;

use App\Models\Usee\Usee;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class UseeControllerTest extends TestCase
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

    
    
    public function it_can_list_usees()
    {
        Usee::insert([
            'name' => "Sample text",
        ]);

        $response = $this->getJson(route('usee.index'));

        $response->assertOk();
    }

    

    public function it_can_create_a_usee()
    {
        $data = [
            'name' => "Sample text",
        ];

        $response = $this->postJson(route('usee.store'), $data);
        
        $response->assertOk();
        $this->assertDatabaseHas((new Usee())->getTable(), array_filter($data, fn($v) => $v !== null));
    }

    
    
    public function it_can_show_a_usee()
    {
        $usee = Usee::create([
            'name' => "Sample text",
        ]);

        $response = $this->getJson(route('usee.show', (string) $usee->id));

        $response->assertOk();
        $response->assertJsonFragment(array_filter([
            'name' => "Sample text",
        ], fn($v) => $v !== null));
    }

    
    
    public function it_can_update_a_usee()
    {
        $usee = Usee::create([
            'name' => "Sample text",
        ]);
        
        $data = [
            'name' => "Updated sample text",
        ];

        $response = $this->putJson(route('usee.update', (string) $usee->id), $data);

        $response->assertOk();
        $this->assertDatabaseHas((new Usee())->getTable(), array_merge(
            ['_id' => $usee->id],
            array_filter($data, fn($v) => $v !== null)
        ));
    }

    
    
    public function it_can_soft_delete_a_usee()
    {
        $usee = Usee::create([
            'name' => "Sample text",
        ]);

        $response = $this->deleteJson(route('usee.destroy', (string) $usee->id));

        $response->assertOk();
        $this->assertSoftDeleted((new Usee())->getTable(), [
            '_id' => $usee->id,
        ]);
    }

    

    public function it_can_force_delete_a_usee()
    {
        $usee = Usee::create([
            'name' => "Sample text",
        ]);
        
        $usee->delete();

        $usee->forceDelete();

        $this->assertDatabaseMissing((new Usee())->getTable(), [
            '_id' => $usee->id,
        ]);
    }
}