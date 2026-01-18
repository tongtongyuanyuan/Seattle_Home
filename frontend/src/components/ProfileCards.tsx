import Image from 'next/image';

interface Agent {
  name: string;
  title: string;
  credibility: string;
  email: string;
  phone: string;
  image?: string;
}

const agents: Agent[] = [
  {
    name: 'Renee Yu',
    title: 'Senior Real Estate Agent',
    credibility: '15+ years of professional experience helping families find their dream homes in Seattle',
    email: 'renee@seattlehomepicks.com',
    phone: '(917) 969-8255',
  },
  {
    name: 'Rachel Xue',
    title: 'Real Estate Agent',
    credibility: 'Professional real estate agent with deep neighborhood knowledge and practical advice',
    email: 'tongxue616@gmail.com',
    phone: '(425) 393-0235',
    image: '/rachelXue.png',
  },
];

export default function ProfileCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {agents.map((agent) => (
        <div
          key={agent.email}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow"
        >
          {agent.image && (
            <div className="mb-6 flex justify-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-100">
                <Image
                  src={agent.image}
                  alt={agent.name}
                  fill
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
            <p className="flex items-center gap-2">
              <span className="font-semibold">Email:</span>
              <a href={`mailto:${agent.email}`} className="text-blue-600 hover:underline">
                {agent.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Phone:</span>
              <a href={`tel:${agent.phone}`} className="text-blue-600 hover:underline">
                {agent.phone}
              </a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
