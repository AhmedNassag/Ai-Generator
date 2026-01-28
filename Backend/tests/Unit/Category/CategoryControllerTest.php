<?php

namespace Tests\Feature\Category;

use App\Models\Category\Category;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class CategoryControllerTest extends TestCase
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

    
    
    public function it_can_list_categorys()
    {
        Category::insert([
            'name' => "Sample text",
        ]);

        $response = $this->getJson(route('category.index'));

        $response->assertOk();
    }

    

    public function it_can_create_a_category()
    {
        $data = [
            'name' => "Sample text",
        ];

        $response = $this->postJson(route('category.store'), $data);
        
        $response->assertOk();
        $this->assertDatabaseHas((new Category())->getTable(), array_filter($data, fn($v) => $v !== null));
    }

    
    
    public function it_can_show_a_category()
    {
        $category = Category::create([
            'name' => "Sample text",
        ]);

        $response = $this->getJson(route('category.show', (string) $category->id));

        $response->assertOk();
        $response->assertJsonFragment(array_filter([
            'name' => "Sample text",
        ], fn($v) => $v !== null));
    }

    
    
    public function it_can_update_a_category()
    {
        $category = Category::create([
            'name' => "Sample text",
        ]);
        
        $data = [
            'name' => "Updated sample text",
        ];

        $response = $this->putJson(route('category.update', (string) $category->id), $data);

        $response->assertOk();
        $this->assertDatabaseHas((new Category())->getTable(), array_merge(
            ['_id' => $category->id],
            array_filter($data, fn($v) => $v !== null)
        ));
    }

    
    
    public function it_can_soft_delete_a_category()
    {
        $category = Category::create([
            'name' => "Sample text",
        ]);

        $response = $this->deleteJson(route('category.destroy', (string) $category->id));

        $response->assertOk();
        $this->assertSoftDeleted((new Category())->getTable(), [
            '_id' => $category->id,
        ]);
    }

    

    public function it_can_force_delete_a_category()
    {
        $category = Category::create([
            'name' => "Sample text",
        ]);
        
        $category->delete();

        $category->forceDelete();

        $this->assertDatabaseMissing((new Category())->getTable(), [
            '_id' => $category->id,
        ]);
    }
}