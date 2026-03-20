<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Egg;

class UserQuotaController extends ClientApiController
{
    /**
     * Return user's quota limits and current usage.
     */
    public function quota(Request $request)
    {
        $user = $request->user();

        // Calculate usage across all owned servers
        $servers = Server::where('owner_id', $user->id)->get();

        $usage = [
            'memory' => $servers->sum('memory'),
            'cpu' => $servers->sum('cpu'),
            'disk' => $servers->sum('disk'),
            'server_count' => $servers->count(),
        ];

        return response()->json([
            'usage' => $usage,
            'limits' => [
                'ram_quota' => $user->ram_quota ?? 0,
                'cpu_quota' => $user->cpu_quota ?? 0,
                'disk_quota' => $user->disk_quota ?? 0,
                'server_limit' => $user->server_limit ?? 0,
            ]
        ]);
    }

    /**
     * Return deployable eggs.
     */
    public function deployableEggs()
    {
        $eggs = Egg::where('is_deployable', true)->get([
            'id', 
            'name', 
            'description', 
            'deploy_name', 
            'is_minecraft'
        ]);

        return response()->json([
            'data' => $eggs
        ]);
    }
}
