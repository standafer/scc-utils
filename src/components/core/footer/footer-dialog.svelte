<script lang="ts">
    import Eyes from "~icons/fluent-emoji-flat/eyes?raw&width=100%25&height=100%25";
    import HeartFace from "~icons/fluent-emoji-flat/smiling-face-with-hearts?raw&width=100%25&height=100%25";
    import Heart from "~icons/fluent-emoji-flat/sparkling-heart?raw&width=100%25&height=100%25";
    import PartyPopper from "~icons/fluent-emoji-flat/party-popper?raw&width=100%25&height=100%25";

    import OutwardIcon from "@/components/outward-icon.svelte";
    import * as Dialog from "@/components/ui/dialog";
    import * as Tabs from "@/components/ui/tabs";
    import * as Accordion from "@/components/ui/accordion";
    import * as Tooltip from "@/components/ui/tooltip";
    import { Button } from "@/components/ui/button";
    import FooterDialogTab from "./footer-dialog-tab.svelte";
    import { CHANGELOG } from "@/library/changelog";
    import { formatDistance } from "date-fns/formatDistance";

    export let tab: "donate" | "changelog" = "donate";

    function getAge(birthDate: string) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }

        return age;
    }

    function getArticle(age: number) {
        return ["8", "11", "18"].includes(age.toString()) ? "an" : "a";
    }

    const age = getAge("2006-06-04");
    const article = getArticle(age);
</script>

<Dialog.Content class="h-[90%] p-0">
    <Tabs.Root value={tab} class="relative w-full h-full overflow-hidden p-0">
        <Tabs.Content
            value="donate"
            class="h-full mt-0 overflow-y-auto no-scrollbar"
        >
            <FooterDialogTab>
                <svelte:fragment slot="title">
                    <span class="mr-2 h-[100%]">
                        {@html HeartFace}
                    </span>
                    Support the project
                </svelte:fragment>
                <div slot="root">
                    <p class="text-sm leading-6">
                        I'm {article}
                        {age} year old college student who loves to build things.
                        This project is maintained by a single person and is
                        <b>completely free to use.</b> Building this has been expensive,
                        both in terms of time and money. Typically, the costs even
                        out to around $0/month** for the host + around $25,000 in
                        tuition fees per semester for the university I plan on transferring
                        to after community college.
                    </p>
                    <p class="mt-2 text-sm leading-6">
                        If you would like to support the project, or support me
                        going through college, please consider donating. Thank
                        you!
                    </p>

                    <p class="mt-2 text-xs">
                        **recently switched hosting provider to GitHub pages so
                        hosting is now free!
                    </p>

                    <Tooltip.Root openDelay={0}>
                        <Tooltip.Trigger>
                            <Button
                                class="mt-4"
                                href="https://www.buymeacoffee.com/ethans"
                                target="_blank"
                            >
                                <span class="mr-2 h-full">
                                    {@html Heart}
                                </span>
                                My BuyMeACoffee
                                <span class="ml-2 h-full">
                                    <OutwardIcon />
                                </span>
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            <p>
                                This is an external link to my BuyMeACoffee page
                            </p>
                        </Tooltip.Content>
                    </Tooltip.Root>
                </div>
            </FooterDialogTab>
        </Tabs.Content>
        <Tabs.Content
            value="changelog"
            class="h-full mt-0 no-scrollbar overflow-y-auto"
        >
            <FooterDialogTab>
                <svelte:fragment slot="title">
                    <span class="mr-2 h-[100%]">
                        {@html Eyes}
                    </span>
                    What's new?
                </svelte:fragment>
                <div slot="root" class="h-[100%] overflow-y-auto">
                    <Accordion.Root class="w-full">
                        {#each CHANGELOG as { version, released, image, changes }}
                            <Accordion.Item value={version}>
                                <Accordion.Trigger class="p-0">
                                    <Button
                                        variant="link"
                                        class="flex items-center justify-between w-full p-0"
                                    >
                                        <div>
                                            Version {version}
                                        </div>
                                        <div>
                                            {released
                                                ? formatDistance(
                                                      new Date(released),
                                                      new Date(),
                                                      {
                                                          addSuffix: true,
                                                      },
                                                  )
                                                : "Unreleased"}
                                        </div>
                                    </Button>
                                </Accordion.Trigger>
                                <Accordion.Content>
                                    <img
                                        src={image}
                                        alt=""
                                        class="w-full h-[150px] object-cover rounded-md mb-4"
                                    />
                                    <ul class="list-disc list-inside mt-4">
                                        {#each changes as change}
                                            <li>{change}</li>
                                        {/each}
                                    </ul>
                                </Accordion.Content>
                            </Accordion.Item>
                        {/each}
                    </Accordion.Root>
                </div>
            </FooterDialogTab>
        </Tabs.Content>
        <div class="absolute bottom-0 w-full h-10 px-6 mb-4">
            <Tabs.List class="w-full shadow-sm">
                <div class="flex flex-row gap-0 h-full w-full">
                    <Tabs.Trigger value="donate" class="h-full basis-1/2">
                        <span class="h-[100%] mr-2">
                            {@html Heart}
                        </span>
                        Donate
                    </Tabs.Trigger>
                    <Tabs.Trigger value="changelog" class="h-full basis-1/2">
                        <span class="h-[100%] mr-2">
                            {@html PartyPopper}
                        </span>
                        Changelog
                    </Tabs.Trigger>
                </div>
            </Tabs.List>
        </div>
    </Tabs.Root>
</Dialog.Content>
