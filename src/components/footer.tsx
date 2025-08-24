import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800/30 mt-auto">
      <div className="container mx-auto px-4 py-3">
        <div className="text-center text-xs text-gray-500 font-mono">
          <div className="mb-1 opacity-50">────────────────────────────</div>
          <div>
            © 2025 SplitSpree • Built by{' '}
            <Link
              href="https://github.com/itisu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Itiza Subedi
            </Link>{' '}
            &{' '}
            <Link
              href="https://github.com/bkshgtm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Bikash Gautam
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
