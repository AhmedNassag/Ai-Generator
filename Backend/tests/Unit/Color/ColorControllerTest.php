<?php

namespace Tests\Feature\Color;

use App\Models\Color\Color;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ColorControllerTest extends TestCase
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

    /** @test */
    public function it_can_list_Colors()
    {
        Color::insert([
            ['name' => 'Color 1', 'hexcolor' => '#FF0000'],
        ]);

        $response = $this->getJson(route('color.index'));

        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Color()
    {
        $data = [
            'name' => 'Color',
            'hexcolor' => '#123456', // Add required field
        ];

        $response = $this->postJson(route('color.store'), $data);

        $response->assertOk();
        $this->assertDatabaseHas((new Color())->getTable(), [
            'name' => 'Color',
            'hexcolor' => '#123456',
        ]);
    }

    /** @test */
    public function it_can_show_a_Color()
    {
        $Color = Color::create([
            'name' => 'Color Test',
            'hexcolor' => '#00FF00', // Include required field
        ]);

        $response = $this->getJson(route('color.show', (string) $Color->id));

        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Color->name,
            'hexcolor' => $Color->hexcolor,
        ]);
    }

    /** @test */
    public function it_can_update_a_Color()
    {
        $Color = Color::create([
            'name' => 'Color Test',
            'hexcolor' => '#00FF00',
        ]);
        $data = [
            'name' => 'Updated Color',
            'hexcolor' => '#123456', // Add required field
        ];

        $response = $this->putJson(route('color.update', (string) $Color->id), $data);

        $response->assertOk();
        $this->assertDatabaseHas((new Color())->getTable(), [
            '_id' => $Color->id,
            'name' => 'Updated Color',
            'hexcolor' => '#123456',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Color()
    {
        $Color = Color::create([
            'name' => 'Color Test',
            'hexcolor' => '#00FF00', // Add required field
        ]);

        $response = $this->deleteJson(route('color.destroy', (string) $Color->id), [
            'forceDelete' => false,
        ]);

        $response->assertOk();
        $this->assertSoftDeleted((new Color())->getTable(), [
            '_id' => $Color->id,
        ]);

        $responseForceDelete = $this->deleteJson(route('color.destroy', (string) $Color->id), [
            'forceDelete' => true,
        ]);

        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Color())->getTable(), [
            '_id' => $Color->id,
        ]);
    }
}
