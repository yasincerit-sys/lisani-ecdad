<?php

use App\Models\User;
use App\Support\AiBotRegistry;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        AiBotRegistry::ensureBotsExist();

        foreach (AiBotRegistry::BOTS as $bot) {
            User::where('email', $bot['email'])->update(['name' => $bot['name']]);
        }

        User::where('role', 'bot')
            ->where('name', 'like', '% Bot')
            ->get()
            ->each(function (User $user) {
                $user->name = preg_replace('/\s+Bot$/u', '', $user->name);
                $user->save();
            });
    }

    public function down(): void
    {
        $legacy = [
            'bot.elif@lisaniecdad.app' => 'Elif Bot',
            'bot.lugat@lisaniecdad.app' => 'Lügat Bot',
            'bot.tercume@lisaniecdad.app' => 'Tercüme Bot',
            'bot.hikmet@lisaniecdad.app' => 'Hikmet Bot',
        ];

        foreach ($legacy as $email => $name) {
            User::where('email', $email)->update(['name' => $name]);
        }
    }
};
