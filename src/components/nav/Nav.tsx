import { Route, Routes, useLocation } from "@solidjs/router"
import { For, Show, createEffect, createSignal } from "solid-js"
import {
	LEARN_SECTIONS,
	REFERENCE_SECTIONS,
	SECTIONS,
	SECTION_LEAF_PAGE,
	SECTION_PAGE,
} from "~/NAV_SECTIONS"
import { NavHeader } from "./NavHeader"
import { Collapsible, NavItem } from "./NavSection"

export default function Nav() {
	const [showMenu, setShowMenu] = createSignal(false)
	const location = useLocation()

	createEffect((prev) => {
		if (location.pathname !== prev) {
			setShowMenu(false)
		}
		return location.pathname
	})

	return (
		<div class="lg:max-h-screen lg:sticky lg:top-0 no-bg-scrollbar lg:min-w-[250px] lg:max-w-xs w-full z-50 overflow-y-auto flex flex-col lg:pr-4 mb-5">
			<div class="flex flex-col">
				<NavHeader
					showMenu={showMenu()}
					setShowMenu={setShowMenu}
				/>
			</div>
			<div class="leading-tight border px-3 py-3 mt-7 rounded-lg bg-gradient-to-br dark:from-solid-accent from-solid-lightlink dark:to-solid-darkbg to-solid-accent text-center text-solid-lightbg font-medium ">
				<span class="block">
				We're eager to hear your thoughts on our new docs!
				</span>
				<button class="hover:cursor-pointer bg-solid-lightitem hover:bg-solid-darklink hover:transition  ease-in-out px-1 py-[2px] mt-3 rounded-md border border-solid-darklink text-solid-darkitem font-semibold text-sm">
					Give us some feedback
				</button>
			</div>
			<div
				classList={{
					hidden: !showMenu(),
					"lg:block border-b md:border-none border-solid-e dark:border-solid-darkitem mb-4":
						true,
				}}
			>
				<TopMenu />
		</div>
	</div>
	)
}

function TopMenu() {
	return (
		<aside class="w-full">
			<nav
				class="scrolling-touch scrolling-gpu"
				style={{ "--bg-opacity": "0.2" }}
			>
				<Routes>
					<Route path={"/reference/*"} component={ReferenceNav} />
					<Route path="/**/*" component={LearnNav} />
				</Routes>
			</nav>
		</aside>
	)
}

export function getNextPrevPages(pathname: string, sections: SECTIONS) {
	const allLearnSections = getAllSections(sections)
	const nextPrevPages: SECTION_LEAF_PAGE[] = []

	const currentPageIndex = allLearnSections.findIndex((v) =>
		v.link.startsWith(pathname)
	)
	const nextPage = allLearnSections[currentPageIndex + 1]
	const prevPage = allLearnSections[currentPageIndex - 1]

	nextPrevPages.push(...[prevPage, nextPage])

	return nextPrevPages
}

function getAllSections(
	sections: SECTIONS | (SECTION_PAGE | SECTION_LEAF_PAGE)[]
): SECTION_LEAF_PAGE[] {
	const allSections: SECTION_LEAF_PAGE[] = []

	for (const section in sections) {
		const doesSectionContainPages = sections[section].pages !== undefined
		if (doesSectionContainPages) {
			for (const page of sections[section].pages) {
				const doesPageContainInnerPages =
					(page as SECTION_PAGE).pages !== undefined
				if (doesPageContainInnerPages) {
					allSections.push(...getAllSections((page as SECTION_PAGE).pages))
				} else {
					allSections.push(page)
				}
			}
		} else {
			allSections.push(sections[section])
		}
	}

	return allSections
}

function ReferenceNav() {
	return <SectionNav sections={REFERENCE_SECTIONS} />
}

function LearnNav() {
	return <SectionNav sections={LEARN_SECTIONS} />
}

function SectionsNavIterate(props: {
	pages: Array<SECTION_PAGE | SECTION_LEAF_PAGE>
}) {
	const location = useLocation()

	function isLeafPage(
		page: SECTION_PAGE | SECTION_LEAF_PAGE
	): page is SECTION_LEAF_PAGE {
		return "link" in page
	}

	const isCollapsed = (
		pages: Array<SECTION_PAGE | SECTION_LEAF_PAGE>,
		pathname: string
	) => {
		return !pages.some((page) => {
			return isLeafPage(page) && pathname == page?.link
		})
	}

	return (
		<For each={props.pages}>
			{(subsection: SECTION_LEAF_PAGE | SECTION_PAGE) => (
				<>
					<Show when={isLeafPage(subsection)}>
						<NavItem
							href={(subsection as SECTION_LEAF_PAGE).link}
							title={subsection.name}
						>
							{subsection.name}
						</NavItem>
					</Show>
					<Show when={(subsection as SECTION_PAGE).pages}>
						<ul class="ml-2">
							<Collapsible
								header={subsection.name}
								startCollapsed={() =>
									isCollapsed(
										(subsection as SECTION_PAGE).pages,
										location.pathname
									)
								}
							>
								<SectionsNavIterate
									pages={(subsection as SECTION_PAGE).pages}
								/>
							</Collapsible>
						</ul>
					</Show>
				</>
			)}
		</For>
	)
}

function SectionNav(props: { sections: SECTIONS }) {
	const sectionNames = Object.keys(props.sections)

	return (
		<ul class="flex flex-col">
			<For each={sectionNames}>
				{(name, i) => (
					<li>
						<a class="pb-1 pl-2 text-solid-dark dark:text-white font-semibold flex items-center mt-6"
						>
							{props.sections[name].name}
						</a>
							<SectionsNavIterate pages={props.sections[name].pages} />
					</li>
				)}
			</For>
		</ul>
	)
}
