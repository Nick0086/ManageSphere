import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { memo, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const ImagePlaceholder = memo(() => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
    </div>
));

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

const MenuItem = memo(({ item }) => {

    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
        rootMargin: '100px 0px', // Reduced margin for earlier loading
    });

    return (
        <div ref={ref} className="h-full">
            {inView ? (
                <Card className="flex flex-col justify-between overflow-hidden h-full relative ">
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

export default function TemplateMenuViewerLayout({ templateConfig }) {

    const categories = templateConfig?.categories || [];

    const [displayCount, setDisplayCount] = useState(12);
    const [loadingMore, setLoadingMore] = useState(false);

    const { ref, inView } = useInView({ threshold: 0, rootMargin: "300px 0px" });

    useEffect(() => {
        if (inView && !loadingMore && categories?.length > displayCount) {
            setLoadingMore(true);
            setTimeout(() => {
                setDisplayCount((prevCount) => Math.min(prevCount + 6, categories.length));
                setLoadingMore(false);
            }, 300);
        }
    }, [inView, loadingMore, categories?.length, displayCount]);

    return (
        <div className='p-4 bg-gray-100/90 min-h-[90dvh] max-h-[90dvh] overflow-auto'>
            <Accordion type="multiple" defaultValue={categories.map(c => c.id || c.unique_id || c.name)} className="space-y-4">
                {categories?.filter(category => category?.visible)?.map((category) => {
                    const categoryId = category.id || category.unique_id || category.name;

                    return (
                        <AccordionItem
                            key={categoryId}
                            value={categoryId}
                            className={cn("bg-card rounded-md overflow-hidden border-none px-3")}
                        >
                            <AccordionTrigger className="py-3 px-2 hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-1.5 bg-primary rounded-full hidden sm:block"></div>
                                    <h2 className="text-xl font-semibold">{category?.name}</h2>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                                    {category?.items?.filter(i => i?.visible).slice(0, displayCount).map((item) => (
                                        <MenuItem key={item.unique_id || item.id} item={item} />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            <div ref={ref} />
        </div>
    );

}