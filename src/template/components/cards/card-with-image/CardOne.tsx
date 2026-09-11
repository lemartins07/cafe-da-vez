import { Card, CardDescription, CardTitle } from '../../ui/card';
import { Link } from 'react-router';

export default function CardOne() {
  return (
    <Card>
      <div>
        <div className="mb-5 overflow-hidden rounded-lg">
          <img
            src="/template/images/cards/card-01.png"
            alt="card"
            className="overflow-hidden rounded-lg"
          />
        </div>
        <div>
          <CardTitle>Card title</CardTitle>
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
      </div>
    </Card>
  );
}
