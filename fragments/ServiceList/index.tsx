import { Service } from '@/models/service';

type ServiceListProps = {
  services: Service[];
};

export default function ServiceList({ services }: ServiceListProps) {
  services.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <>
      <section>
        {services.map((service) => (
          <div key={`${service.slug!}--section`}>
            <a href={`/services/${service.slug}`} className="flex flex-col pt-2 pb-3 border-b-gray-300 border-b-2">
              <div className="text-lg leading-none">
                {service.humanReadableTitle}
                {service.worshipLeader && ` (${service.worshipLeader})`}
              </div>
            </a>
          </div>
        ))}
      </section>
    </>
  );
}
