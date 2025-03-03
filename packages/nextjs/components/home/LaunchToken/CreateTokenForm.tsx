"use client";

import { FC, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import InputField from "~~/components/common/InputField";
import { useTokenCreation } from "~~/hooks/createToken";
import { DiscordIcon, GlobeIcon, TelegramIcon, XIcon } from "~~/icons/socials";
import { IPFSMetadata } from "~~/types/types";
import { resizeImage } from "~~/utils/imageHandler";

// ... other imports

const CreateTokenSchema = z.object({
  name: z.string().nonempty({ message: "Token name is required" }),
  symbol: z.string().nonempty({ message: "Token symbol is required" }),
  description: z.string().default(""),
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

  const form = useForm<IPFSMetadata>({
    resolver: zodResolver(CreateTokenSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-4 flex flex-col gap-4">
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
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormLabel>Social Links</FormLabel>
        <div className="grid grid-cols-2 gap-2">
          <FormField
            name="socials.twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <InputField placeholder="X (Twitter)" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="socials.telegram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telegram</FormLabel>
                <InputField placeholder="Telegram" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="socials.discord"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discord</FormLabel>
                <InputField placeholder="Discord" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="socials.website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <InputField placeholder="Website" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <label htmlFor="" className="flex flex-col items-start">
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
