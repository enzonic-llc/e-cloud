<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Base;
use Pterodactyl\Http\Middleware\RequireTwoFactorAuthentication;

Route::get('/', [Base\IndexController::class, 'index'])->name('index')->fallback();
Route::get('/account', [Base\IndexController::class, 'index'])
    ->withoutMiddleware(RequireTwoFactorAuthentication::class)
    ->name('account');

Route::get('/locales/locale.json', Base\LocaleController::class)
    ->withoutMiddleware(['auth', RequireTwoFactorAuthentication::class])
    ->where('namespace', '.*');

Route::get('/terms', function () {
    return view('legal.tos');
})->withoutMiddleware(['auth', 'auth.session', RequireTwoFactorAuthentication::class])->name('legal.tos');

Route::get('/privacy', function () {
    return view('legal.privacy');
})->withoutMiddleware(['auth', 'auth.session', RequireTwoFactorAuthentication::class])->name('legal.privacy');

Route::get('/{react}', [Base\IndexController::class, 'index'])
    ->where('react', '^(?!(\/)?(api|auth|admin|daemon)).+');
