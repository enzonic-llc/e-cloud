@extends('templates/wrapper', [
    'css' => ['body' => 'bg-neutral-800 text-neutral-200']
])

@section('container')
<div class="min-h-screen flex flex-col pt-10 px-4">
    <div class="max-w-4xl mx-auto bg-neutral-900 rounded-lg shadow-lg p-8 w-full">
        <h1 class="text-3xl font-bold mb-6 text-primary-500">Privacy Policy</h1>
        <div class="prose prose-invert max-w-none">
            <p><strong>Effective Date:</strong> {{ date('F j, Y') }}</p>
            <p>At Enzonic Cloud (operated by Enzonic LLC, KY), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.</p>
            
            <h2 class="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, update your profile, or contact customer support. This may include your name, email address, and server data.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you about your account or support requests.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">3. Information Sharing</h2>
            <p>We do not share, sell, or rent your personal information to third parties, except as required by law or as necessary to provide our services.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
            <p>We implement reasonable security measures to protect your personal information from unauthorized access or disclosure.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">5. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.</p>

            <h2 class="text-xl font-semibold mt-6 mb-2">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:admin@enzonic.com" class="text-primary-400 hover:text-primary-300">admin@enzonic.com</a>.</p>
        </div>
        <div class="mt-8 pt-4 border-t border-neutral-700 flex gap-4">
            <a href="/" class="text-primary-500 hover:text-primary-400">&larr; Back to Home</a>
            <a href="/terms" class="text-neutral-400 hover:text-neutral-300">Terms of Service</a>
        </div>
    </div>
</div>
@endsection