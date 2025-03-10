"use client";

import { FC, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import InputField from "~~/components/common/InputField";
import { NFTList } from "~~/constants/merkleRoots";
import { useTokenCreation } from "~~/hooks/createToken";
import { DiscordIcon, GlobeIcon, TelegramIcon, XIcon } from "~~/icons/socials";
import { MultiSelect } from "~~/src/components/ui/multiselect";
import { Slider } from "~~/src/components/ui/slider";
import { Switch } from "~~/src/components/ui/switch";
import { IPFSMetadata } from "~~/types/types";
import { resizeImage } from "~~/utils/imageHandler";

// ... other imports

const CreateTokenSchema = z.object({
  name: z.string().nonempty({ message: "Token name is required" }),
  symbol: z.string().nonempty({ message: "Token symbol is required" }),
  description: z.string().default(""),
  airdrop: z.array(z.string()).default(["diamondHands"]),
  airdropPercentage: z.number().min(1).max(50).default(1),
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

const CreateTokenForm: FC = () => {
  //   const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<z.infer<typeof CreateTokenSchema>>({
    resolver: zodResolver(CreateTokenSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      airdrop: ["diamondHands"],
      airdropPercentage: 1,
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

  const onSubmit = async (data: IPFSMetadata & { airdrop: string[]; airdropPercentage: number }) => {
    setIsUploading(true);

    try {
      const metadataUri = await createToken({
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        socials: data.socials,
        airdrop: data.airdrop,
        airdropPercentage: data.airdropPercentage,
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
        <div className="flex gap-32 mb-12">
          <div className="w-3/6 flex flex-col gap-4">
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
          <div className="w-3/6 flex flex-col gap-1">
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
        {/* Advanced Options Toggle */}
        <div className="flex items-center space-x-2 mb-4">
          <Switch id="advanced-options" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
          <label htmlFor="advanced-options" className="cursor-pointer">
            Advanced Options
          </label>
        </div>

        {showAdvanced && (
          <>
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

            {/* Airdrop Percentage Slider */}
            <FormField
              name="airdropPercentage"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-4 mb-12">
                  <FormLabel>Airdrop Percentage ({field.value}%)</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={50}
                      step={1}
                      value={[field.value]}
                      onValueChange={values => field.onChange(values[0])}
                      className="w-full "
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              name="airdrop"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1 mb-12">
                  <FormLabel>Airdrop Community</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={NFTList}
                      onValueChange={field.onChange}
                      defaultValue={[]}
                      placeholder="Select Communities"
                      variant="default"
                      className=""
                      animation={2}
                      maxCount={10}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </>
        )}

        <label htmlFor="" className="flex flex-col items-start mb-12">
          <span>
            All tokens have mandatory 5% airdrop to probabilisitcally selected diamonad handers. Or creator can choose
            existing communities
          </span>
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
