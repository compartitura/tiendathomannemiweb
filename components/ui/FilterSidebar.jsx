import { useRouter } from 'next/router';
import Button from './Button';

export default function FilterSidebar({ filterDefs, filterQuery }) {
  const router = useRouter();
  const updateQuery = newQuery => router.push({ pathname: router.pathname, query: { ...newQuery, page:1 } });
  const toggleFilter = (key,value) => {
    const current = Array.isArray(filterQuery[key]) ? filterQuery[key] : [];
    const next = current.includes(value) ? current.filter(v=>v!==value) : [...current,value];
    updateQuery({ ...router.query, [key]: next });
  };
  const clearAll = () => {
    const q = { ...router.query };
    filterDefs.forEach(def=>delete q[def.key]);
    updateQuery(q);
  };

  return (
    <div className="space-y-4">
      {filterDefs.map(def=>(
        <details key={def.key} className="border rounded-lg">
          <summary className="flex justify-between items-center px-4 py-2 bg-gray-100 cursor-pointer font-semibold list-none">
            {def.name}<span className="text-sm">▾</span>
          </summary>
          <div className="p-4 max-h-60 overflow-auto space-y-2">
            {def.options.map(opt=>(
              <label key={opt} className="inline-flex items-center space-x-2 text-sm">
                <input type="checkbox"
                  checked={Array.isArray(filterQuery[def.key]) && filterQuery[def.key].includes(opt)}
                  onChange={()=>toggleFilter(def.key,opt)}
                  className="form-checkbox h-4 w-4 text-primary"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </details>
      ))}
      <Button variant="outline" onClick={clearAll} className="w-full">Borrar Filtros</Button>
    </div>
  );
}
