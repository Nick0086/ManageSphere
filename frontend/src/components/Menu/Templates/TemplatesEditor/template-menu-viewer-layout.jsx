import React, { memo, useEffect, useState, useMemo } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { DEFAULT_SECTION_THEME } from '../utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/* ImagePlaceholder: Renders a simple SVG placeholder. */
const ImagePlaceholder = memo(() => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </svg>
    </div>
));


const StatusBadge = memo(({ type }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Chip className='gap-1 h-6 w-6 bg-white p-0 flex items-center justify-center' variant='outline' radius='md' size='sm' color={type === "veg" ? 'green' : 'red'}>
                        <div className={cn("h-3 w-3 rounded-full", type === "veg" ? "bg-green-500" : "bg-red-500")} />
                    </Chip>
                </TooltipTrigger>
                <TooltipContent className='z-50' >
                    <p>{type === "veg" ? "Veg" : "Non Veg"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
})

/* OptimizedImage: Uses intersection observer and lazy loading to load images only when in view. */
const OptimizedImage = memo(({ src, alt }) => {
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '150px',
    });

    return (
        <div ref={ref} className="w-full h-56 rounded-lg overflow-hidden">
            {(inView && src) ? (
                <LazyLoadImage
                    src={src}
                    alt={alt || 'Menu item'}
                    effect="blur"
                    className="w-full h-full object-cover"
                    wrapperClassName="w-full h-full"
                    placeholderSrc="/placeholder.jpg"
                    loading="lazy"
                />
            ) : (
                <ImagePlaceholder />
            )}
        </div>
    );
});

/* MenuItem: Renders a single menu item with lazy-loaded image and memoized inline styles. */
const MenuItem = memo(({ item, globalConfig, categoryStyle }) => {
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
        rootMargin: '100px 0px',
    });

    const cardStyle = useMemo(() => {
        if (
            categoryStyle?.card_background_color &&
            DEFAULT_SECTION_THEME?.card_background_color !== categoryStyle?.card_background_color
        ) {
            return { backgroundColor: categoryStyle.card_background_color };
        }
        if (globalConfig?.card_background_color) {
            return { backgroundColor: globalConfig.card_background_color };
        }
        return {};
    }, [globalConfig?.card_background_color, categoryStyle?.card_background_color]);

    const titleStyle = useMemo(() => {
        if (
            categoryStyle?.card_title_color &&
            DEFAULT_SECTION_THEME?.card_title_color !== categoryStyle?.card_title_color
        ) {
            return { color: categoryStyle.card_title_color };
        }
        if (globalConfig?.card_title_color) {
            return { color: globalConfig.card_title_color };
        }
        return {};
    }, [globalConfig?.card_title_color, categoryStyle?.card_title_color]);

    const descriptionStyle = useMemo(() => {
        if (
            categoryStyle?.description_color &&
            DEFAULT_SECTION_THEME?.description_color !== categoryStyle?.description_color
        ) {
            return { color: categoryStyle.description_color };
        }
        if (globalConfig?.description_color) {
            return { color: globalConfig.description_color };
        }
        return {};
    }, [globalConfig?.description_color, categoryStyle?.description_color]);

    return (
        <div ref={ref} className="h-full">
            {inView ? (
                <Card style={cardStyle} className="flex flex-col justify-between overflow-hidden h-full relative">
                    <div className='absolute top-2 right-2 z-[1]' >
                        <StatusBadge type={item?.veg_status} />
                    </div>
                    <OptimizedImage src={item?.image_details?.url} alt={item?.name} />
                    <CardContent className="flex flex-col flex-auto justify-between p-4 px-2">
                        <div className="flex flex-col gap-1">
                            <CardTitle style={titleStyle} className="text-lg text-primary">
                                {item?.name}
                            </CardTitle>
                            <CardDescription style={descriptionStyle} className="text-secondary">
                                {item?.description}
                            </CardDescription>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span style={titleStyle} className="text-base font-bold">
                                ${item?.price}
                            </span>
                            {item.availability === 'in_stock' ? (
                                <Chip variant="light" color="green" radius="md" size="xs">
                                    In Stock
                                </Chip>
                            ) : (
                                <Chip variant="light" color="red" radius="md" size="xs">
                                    Out of Stock
                                </Chip>
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

/* CategoryAccordion: Renders a category with an accordion containing all menu items. */
const CategoryAccordion = memo(({ category, globalConfig }) => {
    const categoryId = category.id || category.unique_id || category.name;
    const categoryStyle = category?.style || {};

    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '300px 0px',
        triggerOnce: true,
    });

    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        if (inView && !isLoaded) {
            setIsLoaded(true);
        }
    }, [inView, isLoaded]);

    const sectionStyle = useMemo(() => {
        if (
            categoryStyle?.section_background_color &&
            DEFAULT_SECTION_THEME?.section_background_color !== categoryStyle?.section_background_color
        ) {
            return { backgroundColor: categoryStyle.section_background_color };
        }
        if (globalConfig?.section_background_color) {
            return { backgroundColor: globalConfig.section_background_color };
        }
        return {};
    }, [globalConfig?.section_background_color, categoryStyle?.section_background_color]);

    const titleBarStyle = useMemo(() => {
        if (
            categoryStyle?.title_color &&
            DEFAULT_SECTION_THEME?.title_color !== categoryStyle?.title_color
        ) {
            return { backgroundColor: categoryStyle.title_color };
        }
        if (globalConfig?.title_color) {
            return { backgroundColor: globalConfig.title_color };
        }
        return {};
    }, [globalConfig?.title_color, categoryStyle?.title_color]);

    const titleTextStyle = useMemo(() => {
        if (
            categoryStyle?.title_color &&
            DEFAULT_SECTION_THEME?.title_color !== categoryStyle?.title_color
        ) {
            return { color: categoryStyle.title_color };
        }
        if (globalConfig?.title_color) {
            return { color: globalConfig.title_color };
        }
        return {};
    }, [globalConfig?.title_color, categoryStyle?.title_color]);

    return (
        <AccordionItem
            key={categoryId}
            value={categoryId}
            className={cn('bg-card rounded-md overflow-hidden border-none px-3')}
            style={sectionStyle}
            id={categoryId}
            ref={ref}
        >
            <AccordionTrigger className="py-3 px-2 hover:no-underline">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-1.5 bg-primary rounded-full hidden sm:block" style={titleBarStyle} />
                    <h2 style={titleTextStyle} className="text-xl font-semibold">
                        {category?.name}
                    </h2>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
                {(inView || isLoaded) ? (
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                        {
                            category?.items?.filter(item => item?.visible)?.length > 0 ?  category?.items?.filter(item => item?.visible).map(item => (
                                <MenuItem
                                    key={item.unique_id || item.id}
                                    globalConfig={globalConfig}
                                    categoryStyle={categoryStyle}
                                    item={item}
                                />
                            )) : <p className='flex items-center justify-center h-20 font-semibold text-lg w-full lg:col-span-3 md:col-span-2 col-span-1' >No Item Available</p>
                        }
                    </div>
                ) : (
                    <div className="h-20 bg-gray-100 animate-pulse rounded-md" />
                )}
            </AccordionContent>
        </AccordionItem>
    );
});

/* TemplateMenuViewerLayout: Main layout that renders all visible categories in an accordion. */
export default function TemplateMenuViewerLayout({ templateConfig }) {
    const categories = templateConfig?.categories || [];
    const globalFromConfig = templateConfig?.global || {};

    const globalConfig = useMemo(
        () => ({
            background_color: globalFromConfig.background_color,
            section_background_color: globalFromConfig.section_background_color,
            title_color: globalFromConfig.title_color,
            card_title_color: globalFromConfig.card_title_color,
            card_background_color: globalFromConfig.card_background_color,
            description_color: globalFromConfig.description_color,
            button_label_color: globalFromConfig.button_label_color,
            button_background_color: globalFromConfig.button_background_color,
        }),
        [
            globalFromConfig.background_color,
            globalFromConfig.section_background_color,
            globalFromConfig.title_color,
            globalFromConfig.card_title_color,
            globalFromConfig.card_background_color,
            globalFromConfig.description_color,
            globalFromConfig.button_label_color,
            globalFromConfig.button_background_color,
        ]
    );

    const visibleCategories = useMemo(
        () => categories.filter(category => category?.visible),
        [categories]
    );

    const firstCategoryId = useMemo(() => {
        if (visibleCategories.length > 0) {
            const firstCategory = visibleCategories[0];
            return firstCategory.id || firstCategory.unique_id || firstCategory.name;
        }
        return null;
    }, [visibleCategories]);

    const containerStyle = useMemo(
        () => (globalConfig?.background_color ? { backgroundColor: globalConfig.background_color } : {}),
        [globalConfig?.background_color]
    );

    return (
        <div className="p-4 bg-gray-100/90 min-h-[90dvh] max-h-[90dvh] overflow-auto" style={containerStyle}>
            <Accordion
                type="multiple"
                defaultValue={firstCategoryId ? [firstCategoryId] : []}
                className="space-y-4"
            >
                {visibleCategories.map(category => (
                    <CategoryAccordion
                        key={category.id || category.unique_id || category.name}
                        globalConfig={globalConfig}
                        category={category}
                    />
                ))}
            </Accordion>
        </div>
    );
}
