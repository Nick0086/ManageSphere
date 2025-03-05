import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, List, Plus } from 'lucide-react'
import React, { useCallback, useState, memo, useEffect, useMemo } from 'react'
import MenuCard from './MenuCard'
import MenuTable from './MenuTable'
import MenuItemForm from './MenuItemForm'
import { useQuery } from '@tanstack/react-query'
import { menuQueryKeyLoopUp } from './utils'
import { getAllCategory, getAllMenuItems } from '@/service/menu.service'
import { queryKeyLoopUp } from '../Categories/utils'
import { toastError } from '@/utils/toast-utils'

// Memoize the header component to prevent unnecessary re-renders
const Header = memo(({ onAddClick }) => (
  <div className="px-2 my-2 pb-2 flex justify-between items-center border-b">
    <h2 className="text-2xl font-medium">Menu Items</h2>
    <div className="flex items-center gap-2">
      <Button
        onClick={onAddClick}
        size="sm"
        className="text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500"
      >
        <div className="flex items-center gap-1">
          <Plus size={18} />
          <span className="text-sm">Add Menu Item</span>
        </div>
      </Button>
      <Separator orientation="vertical" className="h-8 bg-gray-300" />
      <TabsList className="bg-muted rounded-md p-1">
        <TabsTrigger value="table-view" className="p-1.5">
          <List size={20} />
        </TabsTrigger>
        <Separator orientation="vertical" className="h-6 bg-gray-300" />
        <TabsTrigger value="card-view" className="p-1.5">
          <LayoutGrid size={20} />
        </TabsTrigger>
      </TabsList>
    </div>
  </div>
));

// Memoize the content components
const MemoizedMenuTable = memo(MenuTable);
const MemoizedMenuCard = memo(MenuCard);

export default function MenuItemsIndex() {
  const [isModalOpen, setIsModalOpen] = useState({ isOpen: false, isEdit: false, data: null, isDirect : false });
  const [activeTab, setActiveTab] = useState("table-view");

  const handleModalClose = useCallback(() => {
    setIsModalOpen((prv) => ({ ...prv, isOpen: false, isEdit: false, data: null , isDirect : false}));
  }, []);

  const handleAddMenuItem = useCallback(() => {
    setIsModalOpen((prv) => ({ ...prv, isOpen: true, isEdit: false, data: null , isDirect : false}));
  }, []);

  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: [menuQueryKeyLoopUp['item']],
    queryFn: getAllMenuItems,
  });

  // Fetch categories
  const { data: categoryData, isLoading: categoryIsLoading, error: categoryError } = useQuery({
    queryKey: [queryKeyLoopUp['Category']],
    queryFn: getAllCategory,
  });

  useEffect(() => {
    if (error) {
      toastError(`Error fetching Menu Item: ${JSON.stringify(error)}`);
    }
    if (categoryError) {
      toastError(`Error fetching categories: ${JSON.stringify(categoryError)}`);
    }
  }, [error, categoryError]);

    const categoryOptions = useMemo(() => {
      if (categoryData) {
        const categories = categoryData?.data?.categories || [];
        return categories.map((category) => ({
          value: category?.name,
          label: category?.name,
        }));
      }
      return [];
    }, [categoryData]);

  return (
    <div className="w-full">
      <MenuItemForm
        open={isModalOpen?.isOpen}
        isEdit={isModalOpen?.isEdit}
        selectedRow={isModalOpen?.data}
        onHide={handleModalClose}
        isDireact={isModalOpen?.isDirect}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        defaultValue="table-view"
      >
        <Header onAddClick={handleAddMenuItem} />

        {/* Render content conditionally based on active tab */}
        {activeTab === "table-view" && (
          <TabsContent value="table-view" forceMount>
            <MemoizedMenuTable data={data} isLoading={isLoading} categoryOptions={categoryOptions} setIsModalOpen={setIsModalOpen} categoryIsLoading={categoryIsLoading}/>
          </TabsContent>
        )}

        {activeTab === "card-view" && (
          <TabsContent value="card-view" forceMount >
            <MemoizedMenuCard data={data} isLoading={isLoading} categoryOptions={categoryOptions} setIsModalOpen={setIsModalOpen} categoryIsLoading={categoryIsLoading}/>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}