@extends('templates/wrapper', [
    'css' => ['body' => 'bg-neutral-800 text-neutral-200']
])

@section('container')
<div class="min-h-screen flex flex-col pt-10 px-4">
    <div class="max-w-4xl mx-auto bg-neutral-900 rounded-lg shadow-lg p-8 w-full">
        <h1 class="text-3xl font-bold mb-6 text-primary-500">Terms of Service</h1>
        <div class="prose prose-invert max-w-none">
            <p><strong>Effective Date:</strong> {{ date('F j, Y') }}</p>
            <p>Welcome to Enzonic Cloud. These Terms of Service govern your use of our services provided by Enzonic LLC, located in Kentucky (KY).</p>
            
            <h2 class="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these terms, please do not use our services.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">2. Description of Service</h2>
            <p>Enzonic Cloud provides hosting and related services. We reserve the right to modify, suspend, or discontinue the service at any time without notice.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">3. User Responsibilities</h2>
            <p>You are responsible for all activity that occurs under your account. You agree not to use the service for any illegal or unauthorized purpose.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">4. Limitation of Liability</h2>
            <p>In no event shall Enzonic LLC be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">5. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Kentucky (KY), without regard to its conflict of law provisions.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">6. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:admin@enzonic.com" class="text-primary-400 hover:text-primary-300">admin@enzonic.com</a>.</p>
        </div>
        <div class="mt-8 pt-4 border-t border-neutral-700 flex gap-4">
            <a href="/" class="text-primary-500 hover:text-primary-400">&larr; Back to Home</a>
            <a href="/privacy" class="text-neutral-400 hover:text-neutral-300">Privacy Policy</a>
        </div>
    </div>
</div>
@endsection