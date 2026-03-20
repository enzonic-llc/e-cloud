<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Objects\DeploymentObject;
use Pterodactyl\Services\Servers\ServerCreationService;
use Pterodactyl\Services\Servers\ServerDeletionService;
use Pterodactyl\Transformers\Api\Client\ServerTransformer;

class UserServerController extends ClientApiController
{
    private ServerCreationService $creationService;
    private ServerDeletionService $deletionService;

    public function __construct(
        ServerCreationService $creationService,
        ServerDeletionService $deletionService
    ) {
        parent::__construct();
        $this->creationService = $creationService;
        $this->deletionService = $deletionService;
    }

    /**
     * Create a new server for the user.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'egg_id' => 'required|integer|exists:eggs,id',
            'memory' => 'required|integer|min:100|max:128000',
            'cpu' => 'required|integer|min:10|max:1600',
            'disk' => 'required|integer|min:100|max:500000',
            'minecraft_version' => 'sometimes|nullable|string',
        ]);

        $user = $request->user();
        
        $egg = Egg::where('is_deployable', true)->findOrFail($request->input('egg_id'));

        // Check quotas
        $servers = Server::where('owner_id', $user->id)->get();
        $currentMemory = $servers->sum('memory');
        $currentCpu = $servers->sum('cpu');
        $currentDisk = $servers->sum('disk');
        $currentCount = $servers->count();

        $serverLimit = $user->server_limit ?? 0;
        if ($serverLimit !== 0 && $currentCount >= $serverLimit) {
            throw new \Pterodactyl\Exceptions\DisplayException('You have reached your server limit.');
        }

        $ramQuota = $user->ram_quota ?? 0;
        if ($ramQuota !== 0 && ($currentMemory + $request->input('memory')) > $ramQuota) {
            throw new \Pterodactyl\Exceptions\DisplayException('Server creation would exceed your memory quota.');
        }

        $cpuQuota = $user->cpu_quota ?? 0;
        if ($cpuQuota !== 0 && ($currentCpu + $request->input('cpu')) > $cpuQuota) {
            throw new \Pterodactyl\Exceptions\DisplayException('Server creation would exceed your CPU quota.');
        }

        $diskQuota = $user->disk_quota ?? 0;
        if ($diskQuota !== 0 && ($currentDisk + $request->input('disk')) > $diskQuota) {
            throw new \Pterodactyl\Exceptions\DisplayException('Server creation would exceed your disk quota.');
        }

        $mcVersion = $request->input('minecraft_version');
        $environment = [];
        foreach ($egg->variables as $variable) {
            if ($mcVersion && in_array($variable->env_variable, ['MINECRAFT_VERSION', 'VERSION', 'MC_VERSION', 'SERVER_VERSION'])) {
                $environment[$variable->env_variable] = $mcVersion;
            } else {
                $environment[$variable->env_variable] = $variable->default_value;
            }
        }

        $data = [
            'name' => $request->input('name'),
            'owner_id' => $user->id,
            'egg_id' => $egg->id,
            'nest_id' => $egg->nest_id,
            'memory' => $request->input('memory'),
            'cpu' => $request->input('cpu'),
            'disk' => $request->input('disk'),
            'swap' => 0,
            'io' => 500,
            'image' => $egg->docker_image,
            'startup' => $egg->startup,
            'environment' => $environment,
            'database_limit' => 0,
            'allocation_limit' => 0,
            'backup_limit' => 0,
            'start_on_completion' => true,
        ];

        $deployment = new DeploymentObject();
        $deployment->setDedicated(false);
        $deployment->setLocations([]);
        $deployment->setPorts([]);

        $server = $this->creationService->handle($data, $deployment);

        return $this->fractal->item($server)
            ->transformWith($this->getTransformer(ServerTransformer::class))
            ->respond(201);
    }

    /**
     * Delete a user's server.
     */
    public function delete(Request $request, Server $server): Response
    {
        if ($server->owner_id !== $request->user()->id) {
            throw new \Pterodactyl\Exceptions\DisplayException('You do not have permission to delete this server.');
        }

        $this->deletionService->withForce(false)->handle($server);

        return response()->noContent();
    }
}
