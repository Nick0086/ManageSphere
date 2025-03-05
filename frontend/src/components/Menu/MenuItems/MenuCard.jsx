import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import React, { useState, useEffect, memo } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Plus, SquarePen} from 'lucide-react';
import MenuFilters from './components/MenuCardFilters';

// Placeholder component for images during loading
const ImagePlaceholder = memo(() => (
  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
  </div>
));

// Optimized image component with lazy loading
const OptimizedImage = memo(({ src, alt }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '150px', // Preloads images that are 150px away from entering the viewport
  });

  return (
    <div ref={ref} className="w-full h-56 rounded-lg overflow-hidden">
      {inView ? (
        <LazyLoadImage
          src={src}
          alt={alt || 'Menu item'}
          effect="blur"
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
          placeholderSrc="/placeholder.jpg"
          loading="lazy" // Uses native lazy loading as a fallback
        />
      ) : (
        <ImagePlaceholder />
      )}
    </div>
  );
});

// Individual menu item card with intersection observer
const MenuItem = memo(({ item, setIsModalOpen }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '100px 0px', // Reduced margin for earlier loading
  });

  return (
    <div ref={ref} className="h-full">
      {inView ? (
        <Card className="flex flex-col justify-between overflow-hidden h-full relative ">
          <Button onClick={() => { setIsModalOpen((prv) => ({ ...prv, isOpen: true, isEdit: true, data: item, isDirect: false })) }} className='absolute top-2 right-2 z-[1] p-1' variant="primary" size="xs">
            <SquarePen size={16} />
          </Button>
          <OptimizedImage src={item?.image_details?.url} alt={item?.name} />
          <CardContent className="flex flex-col flex-auto justify-between p-4 px-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg text-primary">{item?.name}</CardTitle>
              <CardDescription className="text-secondary">{item?.description}</CardDescription>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-bold">${item?.price}</span>
              {item.availability === 'in_stock' ? (
                <Chip variant="light" color="green" radius="md" size="xs">In Stock</Chip>
              ) : (
                <Chip variant="light" color="red" radius="md" size="xs">Out of Stock</Chip>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
      )}
    </div>
  );
});


export default function MenuCard({ data, isLoading, setIsModalOpen, categoryOptions }) {

  const [menuItems, setMenuItems] = useState([]);
  const [displayCount, setDisplayCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [menuAvailability, setMenuAvailability] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  // Observer for the infinite scroll trigger
  const { ref, inView } = useInView({ threshold: 0, rootMargin: "300px 0px" });

  useEffect(() => {
    if (data?.data?.menuItems) {
      setMenuItems(data.data.menuItems);
    }
  }, [data]);

  // Filtered menu items based on search query and selected categories
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
    const matchesAvailability = menuAvailability.length === 0 || menuAvailability.includes(item.availability);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category_name);

    return matchesSearch && matchesStatus && matchesAvailability && matchesCategory;
  });


  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category_name || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});


  useEffect(() => {
    if (inView && !loadingMore && filteredItems.length > displayCount) {
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayCount((prevCount) => Math.min(prevCount + 6, filteredItems.length));
        setLoadingMore(false);
      }, 300);
    }
  }, [inView, loadingMore, filteredItems.length, displayCount]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setMenuAvailability([]);
    setSelectedCategories([]);
  };

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={`loading-${index}`} className="flex flex-col justify-between overflow-hidden">
            <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />
            <CardContent className="p-4 pt-0">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex justify-between">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (menuItems.length === 0) return<div className='flex items-center justify-center w-full h-[60dvh]' ><p className='text-xl font-semibold text-primary' >No menu items found.</p></div> ;

  return (
    <>
      <MenuFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        menuAvailability={menuAvailability}
        setMenuAvailability={setMenuAvailability}
        categoryOptions={categoryOptions}
        resetFilters={resetFilters}
      />

      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="pb-6 mb-4 border-b-2 border-dashed border-indigo-300 px-2">
          <div className="flex items-center justify-between bg-muted/80 p-3 rounded-md mb-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1.5 bg-primary rounded-full hidden sm:block"></div>
              <h2 className="text-xl font-semibold">{category}</h2>
              <Chip variant="light" color="slate" radius="md" size="xs">
                {items.length} {items.length === 1 ? "item" : "items"}
              </Chip>
            </div>
            <Button
              onClick={() =>
                setIsModalOpen((prev) => ({
                  ...prev,
                  isDirect: true,
                  isOpen: true,
                  isEdit: false,
                  data: { name: "", description: "", price: "", cover_image: "", category_id: items[0]?.category_id, status: 1, availability: "in_stock" },
                }))
              }
              className="!text-xs text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500"
              size="xs"
            >
              <Plus size={14} />
              Add to {category}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {items.slice(0, displayCount).map((item) => (
              <MenuItem key={item.unique_id || item.id} item={item} setIsModalOpen={setIsModalOpen} />
            ))}
          </div>
        </div>
      ))}

      {displayCount < filteredItems.length && (
        <div ref={ref} className="w-full h-20 flex items-center justify-center px-2">
          <div className="w-8 h-8 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
}