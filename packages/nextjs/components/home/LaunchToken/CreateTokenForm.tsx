"use client";

import { FC, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import InputField from "~~/components/common/InputField";
import { NFTList } from "~~/constants/merkleRoots";
import { useTokenCreation } from "~~/hooks/createToken";
import { DiscordIcon, GlobeIcon, TelegramIcon, XIcon } from "~~/icons/socials";
import { cn } from "~~/lib/utils";
import { Button } from "~~/src/components/ui/button";
import { IPFSMetadata } from "~~/types/types";
import { resizeImage } from "~~/utils/imageHandler";

// ... other imports

const CreateTokenSchema = z.object({
  name: z.string().nonempty({ message: "Token name is required" }),
  symbol: z.string().nonempty({ message: "Token symbol is required" }),
  description: z.string().default(""),
  categories: z.array(z.string()).default([]),
  socials: z
    .object({
      twitter: z.string().optional(),
      telegram: z.string().optional(),
      discord: z.string().optional(),
      website: z.string().optional(),
    })
    .default({}),
  imageUrl: z.any().nullable(), // Zod doesn't have a direct File type, so we use z.any() and handle it in the form logic.
});

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => <div className="p-2 bg-primary-500 rounded-lg">{icon}</div>;

const MultiSelect = ({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  // Ensure selected is always an array
  const selectedValues = Array.isArray(selected) ? selected : [];

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(item => item !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter(item => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1">
            {selectedValues.length === 0 ? (
              <span className="text-muted-foreground">Select Communities</span>
            ) : (
              selectedValues.map(value => {
                const option = options.find(opt => opt.value === value);
                return (
                  <Badge key={value} variant="secondary" className="flex items-center gap-1">
                    {option?.label}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleRemove(value);
                      }}
                      className="ml-1 h-4 w-4 rounded-full flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map(option => (
              <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                <Check
                  className={cn("mr-2 h-4 w-4", selectedValues.includes(option.value) ? "opacity-100" : "opacity-0")}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const CreateTokenForm: FC = () => {
  //   const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof CreateTokenSchema>>({
    resolver: zodResolver(CreateTokenSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      categories: [],
      socials: {},
      imageUrl: null,
    },
  });

  const { createToken, isLoading } = useTokenCreation({
    onSuccess: () => {
      console.log("Successfully Created a Token");
      form.reset();
    },
    onError: error => {
      setError(error?.message || "An error occurred during token creation.");
      console.log("Failed to create a Token", error);
    },
  });

  const onSubmit = async (data: IPFSMetadata) => {
    setIsUploading(true);

    try {
      const metadataUri = await createToken({
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        socials: data.socials,
        tokenLogo: data.imageUrl, // Assuming imageUrl is the File object
        initialBuyAmount: 0, // Add this to your form schema if not already present
      });
      console.log("Metadata URI", metadataUri);
    } catch (error) {
      // Error handling is done in the hook via onError callback
      console.error("Error creating token:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-4 flex flex-col gap-4 w-[75%]">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-4">
          <div className="w-4/6 flex flex-col gap-4">
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Name</FormLabel>
                  <FormControl>
                    <div className={`input-field-container`}>
                      <input placeholder="Enter token name" className={`input-field`} {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Symbol</FormLabel>
                  <FormControl>
                    <div className={`input-field-container`}>
                      <input placeholder="Enter token symbol" className={`input-field`} {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
          <div className="w-2/6 flex flex-col gap-1">
            <p className="text-sm">Token Logo*</p>
            <FormField
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputField
                      type="file"
                      label="Token Name"
                      inputClassName="text-sm"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          // User cleared the file input
                          field.onChange(null);
                          return;
                        }
                        // 1) Validate file type
                        if (!file.type.startsWith("image/")) {
                          setError("Please upload a valid image file");
                          return;
                        }
                        try {
                          // 2) Resize the image
                          const resizedFile = await resizeImage(file);

                          // 3) Check final size
                          if (resizedFile.size > 1024 * 1024) {
                            setError("Resized image is still larger than 1MB");
                          } else {
                            // 4) If OK, attach to form
                            field.onChange(resizedFile);
                          }
                        } catch (err) {
                          setError(`${err}: Error processing image`);
                        }
                      }}
                      // onChange={e => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  rows={4}
                  className="input-field resize-none text-sm"
                  placeholder="Add a description for a token"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="mb-12">
          <FormLabel>Social Links</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            <FormField
              name="socials.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <InputField placeholder="X (Twitter)" {...field} />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              name="socials.telegram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram</FormLabel>
                  <InputField placeholder="Telegram" {...field} />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              name="socials.discord"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discord</FormLabel>
                  <InputField placeholder="Discord" {...field} />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              name="socials.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <InputField placeholder="Website" {...field} />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          name="categories"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1 mb-12">
              <FormLabel>Airdrop Community</FormLabel>
              <FormControl>
                <MultiSelect options={NFTList} selected={field.value || []} onChange={field.onChange} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <label htmlFor="" className="flex flex-col items-start mb-12">
          <span>All tokens have mandatory 10% airdrop to probabilisitcally selected diamonad handers</span>
          <span>Users can choose to diamond hand for 1-24 days</span>
        </label>

        <button
          type="submit"
          className="bg-primary-500 text-white-500 w-full justify-center p-2 rounded disabled:opacity-50"
          // onClick={handleInitialStep}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Next"}
        </button>
      </form>
    </Form>
  );
};

export default CreateTokenForm;
