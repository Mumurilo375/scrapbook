<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_unknown_pages_render_the_frontend_404_page(): void
    {
        $response = $this->get('/pagina-que-nao-existe');

        $response
            ->assertNotFound()
            ->assertInertia(fn (Assert $page) => $page->component('Errors/NotFound'));
    }
}
