import Image from 'next/image';

interface Agent {
  name: string;
  title: string;
  credibility: string;
  emails: string[];
  phone: string;
  image?: string;
}

const agents: Agent[] = [
  {
    name: 'Rachel Xue',
    title: 'Real Estate Agent',
    credibility: 'Professional real estate agent with deep neighborhood knowledge and practical advice',
    emails: ['tongxue616@gmail.com', 'rachelxue@kw.com'],
    phone: '(425) 566-0210',
    image: '/rachelXue.png',
  },
];

export default function ProfileCards() {
  return (
    <div className="grid grid-cols-1 gap-8 max-w-md mx-auto">
      {agents.map((agent) => (
        <div
          key={agent.name}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow"
        >
          {agent.image && (
            <div className="mb-6 flex justify-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-100">
                <Image
                  src={agent.image}
                  alt={agent.name}
                  fill
                  sizes="160px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          )}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {agent.name}
          </h3>
          <p className="text-blue-600 font-medium mb-3">{agent.title}</p>
          <p className="text-gray-600 mb-6 leading-relaxed italic">
            {agent.credibility}
          </p>
          <div className="space-y-2 text-sm text-gray-700 border-t pt-4">
            <p className="flex items-start gap-2">
              <span className="font-semibold">Email:</span>
              <span className="flex flex-col">
                {agent.emails.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {email}
                  </a>
                ))}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Phone:</span>
              <a
                href={`tel:${agent.phone.replace(/\D/g, '')}`}
                className="text-blue-600 hover:underline"
              >
                {agent.phone}
              </a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
