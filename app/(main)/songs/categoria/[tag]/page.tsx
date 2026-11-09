import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import Main from "@/components/common/Main";
import { Metadata } from "next";
import ClientCategoryPage from "./ClientCategoryPage";

export const metadata: Metadata = { title: "Categoria" };

export default async function CategoryPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  return (
    <>
      <Main className="max-w-full">
        <ClientCategoryPage tagId={Number(tag)} />
      </Main>
      <ScrollToTopButton />
    </>
  );
}
