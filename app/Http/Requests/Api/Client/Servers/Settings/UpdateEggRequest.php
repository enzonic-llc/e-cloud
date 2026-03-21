<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Settings;

use Webmozart\Assert\Assert;
use Pterodactyl\Models\Server;
use Illuminate\Validation\Rule;
use Pterodactyl\Models\Permission;
use Pterodactyl\Contracts\Http\ClientPermissionsRequest;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class UpdateEggRequest extends ClientApiRequest implements ClientPermissionsRequest
{
    public function permission(): string
    {
        return Permission::ACTION_STARTUP_DOCKER_IMAGE;
    }

    public function rules(): array
    {
        /** @var \Pterodactyl\Models\Server $server */
        $server = $this->route()->parameter('server');

        Assert::isInstanceOf($server, Server::class);

        return [
            'egg_id' => ['required', 'integer', 'exists:eggs,id'],
            'docker_image' => ['required', 'string', 'max:191'],
            'version' => ['nullable', 'string', 'max:191'],
        ];
    }
}
