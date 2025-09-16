<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title')</title>
        <style>
            :root {
                color-scheme: light dark;
            }

            body {
                margin: 0;
                font-family: "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                background: radial-gradient(circle at top, #eef2ff, #f8fafc 45%, #e2e8f0);
                color: #0f172a;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2.5rem 1.5rem;
                line-height: 1.6;
            }

            a {
                color: inherit;
            }

            main {
                width: 100%;
                max-width: 32rem;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 1.75rem;
                padding: 3rem 2.5rem;
                box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08);
                text-align: center;
                backdrop-filter: blur(12px);
            }

            .status {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 5.5rem;
                height: 5.5rem;
                border-radius: 50%;
                background: linear-gradient(135deg, #4f46e5, #7c3aed);
                color: #fff;
                font-size: 1.75rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
                box-shadow: 0 12px 30px rgba(79, 70, 229, 0.35);
            }

            h1 {
                margin: 0 0 0.75rem;
                font-size: 1.9rem;
                font-weight: 700;
            }

            p.message {
                margin: 0 0 1rem;
                font-size: 1.05rem;
                color: #334155;
            }

            p.description {
                margin: 0 0 2rem;
                color: #475569;
            }

            .actions {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                justify-content: center;
                margin-bottom: 1.75rem;
            }

            .button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.75rem 1.5rem;
                border-radius: 9999px;
                font-weight: 600;
                font-size: 0.95rem;
                text-decoration: none;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .button.primary {
                background: linear-gradient(135deg, #4f46e5, #6366f1);
                color: #fff;
                box-shadow: 0 12px 25px rgba(99, 102, 241, 0.35);
            }

            .button.secondary {
                background: rgba(99, 102, 241, 0.12);
                color: #4338ca;
            }

            .button:hover {
                transform: translateY(-1px);
                box-shadow: 0 20px 35px rgba(79, 70, 229, 0.25);
            }

            .support {
                font-size: 0.9rem;
                color: #64748b;
            }

            @media (max-width: 32rem) {
                main {
                    padding: 2.5rem 1.75rem;
                }

                .actions {
                    flex-direction: column;
                }
            }

            @media (prefers-color-scheme: dark) {
                body {
                    background: radial-gradient(circle at top, #1f2937, #111827 55%, #0f172a);
                    color: #e2e8f0;
                }

                main {
                    background: rgba(17, 24, 39, 0.85);
                    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.6);
                }

                p.message,
                p.description,
                .support {
                    color: #cbd5f5;
                }

                .button.secondary {
                    background: rgba(99, 102, 241, 0.18);
                    color: #c7d2fe;
                }
            }
        </style>
    </head>
    <body>
        <main>
            <div class="status">@yield('code')</div>
            <h1>@yield('title')</h1>
            <p class="message">@yield('message')</p>
            @hasSection('description')
                <p class="description">@yield('description')</p>
            @else
                <p class="description">{{ __('Let us help you find your way back to where you need to be.') }}</p>
            @endif
            <div class="actions">
                <a class="button primary" href="{{ url('/') }}">{{ __('Go to homepage') }}</a>
                <a class="button secondary" href="javascript:history.back()">{{ __('Return to last page') }}</a>
            </div>
            @php
                $supportEmail = config('mail.from.address');
            @endphp
            <p class="support">
                {{ __('Still need help?') }}
                @if ($supportEmail)
                    <a href="mailto:{{ $supportEmail }}">{{ $supportEmail }}</a>
                @else
                    <a href="mailto:support@example.com">support@example.com</a>
                @endif
            </p>
        </main>
    </body>
</html>
