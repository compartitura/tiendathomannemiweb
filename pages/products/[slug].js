// pages/products/[...slug].js
import fs from 'fs';
import path from 'path';
import Head from 'next/head';

export async function getServerSideProps({ params }) {
  try {
    const all = JSON.parse(
      fs.readFileSync(path.join(process.cwd(),'data','products.json'),'utf-8')
    );
    const slugArr = Array.isArray(params.slug)?params.slug:[params.slug];
    const last = slugArr[slugArr.length-1];
    let p = all.find(x=>String(x.ArticleNumber)===last);
    if(!p){
      const decoded = decodeURIComponent(last).toLowerCase().replace(/-/g,' ');
      p = all.find(x=>x.Model.toLowerCase()===decoded);
    }
    if(!p) return { notFound: true };
    return { props: { product: p } };
  } catch {
    return { notFound: true };
  }
}

export default function ProductPage({ product }) {
  const title = `${product.Brand} ${product.Model}`;
  return (
    <>
      <Head><title>{title}</title></Head>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <img src={product.ImageURL} alt={product.Model} className="w-full h-64 object-cover rounded mb-4"/>
        {product.Description && <p className="mb-6">{product.Description}</p>}
        <a href={product.affiliateURL} target="_blank" rel="noopener noreferrer"
           className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Comprar en Thomann
        </a>
      </div>
    </>
  );
}
