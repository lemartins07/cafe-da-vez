import { Link } from 'react-router';
import { Card, CardDescription } from '../../ui/card';

export default function CardTwo() {
  return (
    <Card>
      <div className="mb-5 overflow-hidden rounded-lg">
        <img
          src="/images/cards/card-02.png"
          alt="card"
          className="overflow-hidden rounded-lg"
        />
      </div>
      <div>
        <CardDescription>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi
          architecto aspernatur cum et ipsum
        </CardDescription>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
        >
          Read more
        </Link>
      </div>
    </Card>
  );
}
