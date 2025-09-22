interface GalleriaProps {
  edition: string;
}

export default function Galleria({ edition }: GalleriaProps) {
  // TODO: Implement photo gallery using a React-compatible library
  // For now, return a placeholder
  return (
    <div className="container">
      <div className="row justify-content-center p-2">
        <div className="galleria">
          <p>Photo gallery for {edition} - Coming soon</p>
        </div>
      </div>
    </div>
  );
}