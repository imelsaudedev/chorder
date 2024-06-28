import Header from '@/components/Header';
import messages from '@/i18n/messages';

type PageHeaderProps = {
  currentPage: 'songs' | 'services';
};

export default function PageHeader({ currentPage }: PageHeaderProps) {
  return (
    <Header className="gap-4">
      <a href="/songs" className={`${currentPage === 'songs' ? 'font-bold' : ''} text-lg leading-none`}>
        {messages.messages.songs}
      </a>
      <a href="/services" className={`${currentPage === 'services' ? 'font-bold' : ''} text-lg leading-none`}>
        {messages.messages.services}
      </a>
    </Header>
  );
}
