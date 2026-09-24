export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-bad/30 bg-bad/5 px-4 py-3 text-sm text-bad">
      {message}
    </div>
  );
}
