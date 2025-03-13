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

const CreateTokenForm: FC = () => {
  //   const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      setPreviewImage(null);
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
    <section className="max-w-3xl mx-auto">
      <div className="bg-[#1c1b29]/60 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 shadow-xl shadow-purple-500/10">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">Create Your Cult</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 animate-pulse">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="md:col-span-3 space-y-6">
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem className="transition-all duration-200 hover:translate-y-[-2px]">
                      <FormLabel>
                        <p className="text-purple-300 text-sm font-medium mb-1">Token Name</p>
                      </FormLabel>
                      <FormControl>
                        <div className="input-field-container focus-within:ring-2 focus-within:ring-purple-500/50 transition-all duration-200 border-purple-500/30 bg-[#272536]">
                          <input 
                            placeholder="Enter token name" 
                            className="input-field text-white" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 !text-xs mt-1" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  name="symbol"
                  render={({ field }) => (
                    <FormItem className="transition-all duration-200 hover:translate-y-[-2px]">
                      <FormLabel>
                        <p className="text-purple-300 text-sm font-medium mb-1">Token Symbol</p>
                      </FormLabel>
                      <FormControl>
                        <div className="input-field-container focus-within:ring-2 focus-within:ring-purple-500/50 transition-all duration-200 border-purple-500/30 bg-[#272536]">
                          <input 
                            placeholder="Enter token symbol" 
                            className="input-field text-white" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 !text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col">
                <p className="text-purple-300 text-sm font-medium mb-1">Token Logo*</p>
                <FormField
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="h-full">
                      <FormControl>
                        <div className="flex flex-col h-full">
                          <div 
                            className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-36 transition-all duration-300
                              ${previewImage ? 'border-purple-500/40 bg-purple-500/5' : 'border-gray-600 bg-[#272536]/60 hover:border-purple-500/30 hover:bg-[#272536]/80'}`}
                          >
                            {previewImage ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                <img 
                                  src={previewImage} 
                                  alt="Token logo preview" 
                                  className="max-h-full max-w-full object-contain rounded-lg p-2"
                                />
                                <button 
                                  type="button"
                                  className="absolute top-1 right-1 bg-red-500/70 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                  onClick={() => {
                                    field.onChange(null);
                                    setPreviewImage(null);
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="w-12 h-12 mb-2 rounded-full bg-purple-500/20 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-400">Drag & drop or click to upload</p>
                              </>
                            )}
                            <InputField
                              type="file"
                              inputClassName="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file) {
                                  // User cleared the file input
                                  field.onChange(null);
                                  setPreviewImage(null);
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
                                    // 4) If OK, attach to form and show preview
                                    field.onChange(resizedFile);
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      setPreviewImage(e.target?.result as string);
                                    };
                                    reader.readAsDataURL(resizedFile);
                                  }
                                } catch (err) {
                                  setError(`${err}: Error processing image`);
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Maximum size: 1MB</p>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 !text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Advanced Options Toggle */}
            <div className="flex items-center space-x-2 mb-2 p-3 rounded-lg bg-[#272536]/60 hover:bg-[#272536] transition-colors cursor-pointer">
              <Switch 
                id="advanced-options" 
                checked={showAdvanced} 
                onCheckedChange={setShowAdvanced} 
              />
              <label 
                htmlFor="advanced-options" 
                className="cursor-pointer font-medium text-white"
                onClick={(e) => {
                  e.preventDefault();
                  setShowAdvanced(!showAdvanced);
                }}
              >
                Advanced Options {showAdvanced ? '▼' : '▶'}
              </label>
            </div>

            {showAdvanced && (
              <div className="space-y-8 animate-fadeIn">
                <FormField
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1 transition-all duration-200 hover:translate-y-[-2px]">
                      <FormLabel>
                        <p className="text-purple-300 text-sm font-medium mb-1">Description</p>
                      </FormLabel>
                      <FormControl>
                        <textarea
                          rows={4}
                          className="resize-none text-sm bg-[#272536] text-white border-purple-500/30 border rounded-xl w-full p-3 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all duration-200"
                          placeholder="Add a description for your token (markets, utility, community, etc.)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 !text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <div className="p-5 rounded-xl bg-[#272536]/40 border border-purple-500/10">
                  <FormLabel>
                    <p className="text-purple-300 text-sm font-medium mb-3">Social Links</p>
                  </FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      name="socials.twitter"
                      render={({ field }) => (
                        <FormItem className="transition-all duration-200 hover:translate-y-[-2px]">
                          <div className="flex items-center mb-1">
                            <span className="mr-2 text-[#1DA1F2]"><XIcon /></span>
                            <FormLabel>
                              <p className="text-gray-300 text-sm">Twitter/X</p>
                            </FormLabel>
                          </div>
                          <InputField 
                            placeholder="@username or URL" 
                            containerClassName="border-purple-500/20 bg-[#272536]/80 focus-within:ring-2 focus-within:ring-purple-500/50"
                            inputClassName="text-white"
                            {...field} 
                          />
                          <FormMessage className="text-red-400 !text-xs mt-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="socials.telegram"
                      render={({ field }) => (
                        <FormItem className="transition-all duration-200 hover:translate-y-[-2px]">
                          <div className="flex items-center mb-1">
                            <span className="mr-2 text-[#0088cc]"><TelegramIcon /></span>
                            <FormLabel>
                              <p className="text-gray-300 text-sm">Telegram</p>
                            </FormLabel>
                          </div>
                          <InputField 
                            placeholder="t.me/username" 
                            containerClassName="border-purple-500/20 bg-[#272536]/80 focus-within:ring-2 focus-within:ring-purple-500/50"
                            inputClassName="text-white"
                            {...field} 
                          />
                          <FormMessage className="text-red-400 !text-xs mt-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="socials.discord"
                      render={({ field }) => (
                        <FormItem className="transition-all duration-200 hover:translate-y-[-2px]">
                          <div className="flex items-center mb-1">
                            <span className="mr-2 text-[#7289DA]"><DiscordIcon /></span>
                            <FormLabel>
                              <p className="text-gray-300 text-sm">Discord</p>
                            </FormLabel>
                          </div>
                          <InputField 
                            placeholder="discord.gg/invite" 
                            containerClassName="border-purple-500/20 bg-[#272536]/80 focus-within:ring-2 focus-within:ring-purple-500/50"
                            inputClassName="text-white"
                            {...field} 
                          />
                          <FormMessage className="text-red-400 !text-xs mt-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="socials.website"
                      render={({ field }) => (
                        <FormItem className="transition-all duration-200 hover:translate-y-[-2px]">
                          <div className="flex items-center mb-1">
                            <span className="mr-2 text-gray-300"><GlobeIcon /></span>
                            <FormLabel>
                              <p className="text-gray-300 text-sm">Website</p>
                            </FormLabel>
                          </div>
                          <InputField 
                            placeholder="https://example.com" 
                            containerClassName="border-purple-500/20 bg-[#272536]/80 focus-within:ring-2 focus-within:ring-purple-500/50"
                            inputClassName="text-white"
                            {...field} 
                          />
                          <FormMessage className="text-red-400 !text-xs mt-1" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Airdrop Percentage Slider */}
                <FormField
                  name="airdropPercentage"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-4 p-5 rounded-xl bg-[#272536]/40 border border-purple-500/10">
                      <div className="flex items-center justify-between">
                        <FormLabel>
                          <p className="text-purple-300 text-sm font-medium">Airdrop Percentage</p>
                        </FormLabel>
                        <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {field.value}%
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          value={[field.value]}
                          onValueChange={values => field.onChange(values[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 !text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="airdrop"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1 p-5 rounded-xl bg-[#272536]/40 border border-purple-500/10">
                      <FormLabel>
                        <p className="text-purple-300 text-sm font-medium mb-2">Airdrop Community</p>
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={NFTList}
                          onValueChange={field.onChange}
                          defaultValue={["diamondHands"]}
                          placeholder="Select Communities"
                          variant="default"
                          className="border-purple-500/20 bg-[#272536]/80"
                          animation={2}
                          maxCount={10}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 !text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="bg-[#272536]/40 border border-purple-500/10 p-4 rounded-lg mt-4 mb-8">
              <p className="text-sm text-gray-400 italic">
                All tokens have mandatory 5% airdrop to probabilistically selected diamond hands. Or creator can choose existing communities.
              </p>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/20"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Token...</span>
                </div>
              ) : (
                <span>Create Token</span>
              )}
            </button>
          </form>
        </Form>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default CreateTokenForm;
