import { GetServerSideProps } from 'next';

export default function SsrPage() {
  return <p>I was server-side rendered!</p>;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
