import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl mb-6">🎓</p>
        <h1 className="font-display font-bold text-4xl text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 mb-6">Oops! This page doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary inline-flex">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
