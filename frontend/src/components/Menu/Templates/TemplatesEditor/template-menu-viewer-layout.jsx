import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { memo, useEffect, useState, useMemo, useCallback } from 'react'
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

// Extract styles generation to avoid recalculations in renders
const getCardStyle = (backgroundColor) => 
    backgroundColor ? { backgroundColor } : {};

const getTitleStyle = (color) => 
    color ? { color } : {};

const getDescriptionStyle = (color) => 
    color ? { color } : {};

const getSectionStyle = (backgroundColor) => 
    backgroundColor ? { backgroundColor } : {};

const getCategoryIndicatorStyle = (color) => 
    color ? { backgroundColor: color } : {};

// MenuItem component with optimized style handling
const MenuItem = memo(({ item, globalConfig }) => {
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
        rootMargin: '100px 0px', // Reduced margin for earlier loading
    });

    // Memoize styles to prevent recalculation on every render
    const cardStyle = useMemo(() => 
        getCardStyle(globalConfig?.card_background_color), 
        [globalConfig?.card_background_color]
    );
    
    const titleStyle = useMemo(() => 
        getTitleStyle(globalConfig?.card_title_color), 
        [globalConfig?.card_title_color]
    );
    
    const descriptionStyle = useMemo(() => 
        getDescriptionStyle(globalConfig?.description_color), 
        [globalConfig?.description_color]
    );
    
    const priceStyle = useMemo(() => 
        getTitleStyle(globalConfig?.card_title_color), 
        [globalConfig?.card_title_color]
    );

    return (
        <div ref={ref} className="h-full">
            {inView ? (
                <Card
                    style={cardStyle}
                    className="flex flex-col justify-between overflow-hidden h-full relative"
                >
                    <OptimizedImage src={item?.image_details?.url} alt={item?.name} />
                    <CardContent className="flex flex-col flex-auto justify-between p-4 px-2">
                        <div className="flex flex-col gap-1">
                            <CardTitle
                                style={titleStyle}
                                className="text-lg text-primary"
                            >
                                {item?.name}
                            </CardTitle>
                            <CardDescription
                                style={descriptionStyle}
                                className="text-secondary"
                            >
                                {item?.description}
                            </CardDescription>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span style={priceStyle} className="text-base font-bold">
                                ${item?.price}
                            </span>
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
}, (prevProps, nextProps) => {
    // Deep comparison for items and config to prevent unnecessary re-renders
    return (
        prevProps.item === nextProps.item &&
        prevProps.globalConfig?.card_background_color === nextProps.globalConfig?.card_background_color &&
        prevProps.globalConfig?.card_title_color === nextProps.globalConfig?.card_title_color &&
        prevProps.globalConfig?.description_color === nextProps.globalConfig?.description_color
    );
});

// CategoryAccordion component with optimized style handling
const CategoryAccordion = memo(({ category, displayCount, globalConfig }) => {
    const categoryId = category.id || category.unique_id || category.name;
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: "300px 0px",
        triggerOnce: true
    });

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (inView && !isLoaded) {
            setIsLoaded(true);
        }
    }, [inView, isLoaded]);

    // Memoize styles to prevent recalculation on every render
    const sectionStyle = useMemo(() => 
        getSectionStyle(globalConfig?.section_background_color), 
        [globalConfig?.section_background_color]
    );
    
    const indicatorStyle = useMemo(() => 
        getCategoryIndicatorStyle(globalConfig?.title_color), 
        [globalConfig?.title_color]
    );
    
    const titleStyle = useMemo(() => 
        getTitleStyle(globalConfig?.title_color), 
        [globalConfig?.title_color]
    );

    // Memoize filtered items to prevent recalculation
    const visibleItems = useMemo(() => 
        category?.items?.filter(i => i?.visible).slice(0, displayCount) || [],
        [category?.items, displayCount]
    );

    return (
        <AccordionItem
            key={categoryId}
            value={categoryId}
            className={cn("bg-card rounded-md overflow-hidden border-none px-3")}
            style={sectionStyle}
            ref={ref}
        >
            <AccordionTrigger className="py-3 px-2 hover:no-underline">
                <div className="flex items-center gap-2">
                    <div
                        className="h-6 w-1.5 bg-primary rounded-full hidden sm:block"
                        style={indicatorStyle}
                    ></div>
                    <h2
                        className="text-xl font-semibold"
                        style={titleStyle}
                    >
                        {category?.name}
                    </h2>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
                {inView || isLoaded ? (
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                        {visibleItems.map((item) => (
                            <MenuItem 
                                key={item.unique_id || item.id} 
                                globalConfig={globalConfig} 
                                item={item} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}, (prevProps, nextProps) => {
    // Implement custom comparison for CategoryAccordion to prevent unnecessary re-renders
    return (
        prevProps.category === nextProps.category &&
        prevProps.displayCount === nextProps.displayCount &&
        prevProps.globalConfig?.section_background_color === nextProps.globalConfig?.section_background_color &&
        prevProps.globalConfig?.title_color === nextProps.globalConfig?.title_color
    );
});

export default function TemplateMenuViewerLayout({ templateConfig }) {
    // Extract and memoize configuration to avoid recalculations
    const { categories = [], global: globalConfig = {} } = templateConfig || {};
    
    // Filter visible categories and memoize the result
    const visibleCategories = useMemo(() =>
        categories.filter(category => category?.visible),
        [categories]
    );

    // Get the first category's ID for default open state
    const firstCategoryId = useMemo(() => {
        if (visibleCategories.length > 0) {
            const firstCategory = visibleCategories[0];
            return firstCategory.id || firstCategory.unique_id || firstCategory.name;
        }
        return null;
    }, [visibleCategories]);

    const [displayCount, setDisplayCount] = useState(10); // Initial count of items to display per category

    // Memoize the background style
    const backgroundStyle = useMemo(() => 
        globalConfig?.background_color ? { backgroundColor: globalConfig.background_color } : {},
        [globalConfig?.background_color]
    );

    return (
        <div
            className='p-4 bg-gray-100/90 min-h-[90dvh] max-h-[90dvh] overflow-auto'
            style={backgroundStyle}
        >
            <Accordion
                type="multiple"
                defaultValue={firstCategoryId ? [firstCategoryId] : []}
                className="space-y-4"
            >
                {visibleCategories.map((category) => (
                    <CategoryAccordion
                        key={category.id || category.unique_id || category.name}
                        globalConfig={globalConfig}
                        category={category}
                        displayCount={displayCount}
                    />
                ))}
            </Accordion>
        </div>
    );
}