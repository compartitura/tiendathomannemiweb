import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import axios from 'axios';
import cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (compatible; Bot/1.0)';

async function fetchDescription(url) { /*…*/ }

export async function getServerSideProps({ params }) {
  const products = JSON.parse(fs.readFileSync(path.join(process.cwd(),'data','products.json'),'utf-8'));
  const slugArr = Array.isArray(params.slug)?params.slug:[params.slug];
  const last = slugArr[slugArr.length-1];
  let product = products.find(p=>String(p.ArticleNumber)===last);
  if(!product) {
    const decoded=decodeURIComponent(last).toLowerCase().replace(/-/g,' ');
    product=products.find(p=>p.Model.toLowerCase()===decoded);
  }
  if(!product) return { notFound:true };
  if(!product.Description?.trim()){
    const cleanUrl=(product.ProductURL||product.affiliateURL||'').trim().replace(/\s.*$/,'');
    try{ product.Description=await fetchDescription(cleanUrl); }catch{}
  }
  return { props:{ product } };
}

export default function ProductPage({ product }) {
  const title = `${product.Brand} ${product.Model}`;
  return (
    <>
      <Head><title>{title}</title><meta name="description" content={product.Description||''}/></Head>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <img src={product.ImageURL} alt={product.Model} className="w-full h-64 object-cover rounded mb-4"/>
        {product.Description
          ? <p className="mb-6 whitespace-pre-wrap">{product.Description}</p>
          : <p className="italic text-gray-500 mb-6">(sin descripción disponible)</p>
        }
        <a href={product.affiliateURL} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Comprar en Thomann
        </a>
      </div>
    </>
  );
}
