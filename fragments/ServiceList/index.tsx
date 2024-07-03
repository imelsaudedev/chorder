import { Service } from '@/models/service';

type ServiceListProps = {
  services: Service[];
};

export default function ServiceList({ services }: ServiceListProps) {
  services.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <>
      <section>
        {services.map((service) => (
          <div key={`${service.slug!}--section`}>
            <a href={`/services/${service.slug}`} className="flex flex-col pt-2 pb-3 border-b-gray-300 border-b-2">
              <div className="font-bold text-lg leading-none">{service.title}</div>
            </a>
          </div>
        ))}
      </section>
    </>
  );
}
