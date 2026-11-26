import { BottomSheets, Discord, GorhomSheet } from '@unbound-app/api/metro/components';
import { format, messages } from '@unbound-app/i18n';
import { useState, type ReactNode } from 'react';

import StateIcon from '~/components/state-icon';
import useStyles from '~/components/permissions-sheet.style';
import { channelData, guildRoles, memberData, type OverwriteEntry } from '~/lib/data';
import { permissionBits, permissionLabel, type Role } from '~/lib/modules';
import { categorize, has, roleHex, toBigInt, type Bits } from '~/lib/perms';
import type { Target } from '~/lib/targets';

type SheetProps = { target: Target; onClose: () => void };

type Frame = { title: string; onBack?: () => void; children: ReactNode };

/** The sheet's shell: a title, an optional Back button and a scrolling body. */
function Frame({ title, onBack, children }: Frame) {
	const styles = useStyles();
	const { ActionSheet, BottomSheetTitleHeader } = BottomSheets;
	const { BottomSheetScrollView: ScrollView } = GorhomSheet;

	return (
		<ActionSheet scrollable startExpanded>
			<BottomSheetTitleHeader title={title} />
			<ScrollView contentContainerStyle={styles.body}>
				{onBack ? (
					<Discord.Button
						style={styles.back}
						text={messages.BACK}
						variant='secondary'
						size='sm'
						onPress={onBack}
					/>
				) : null}
				{children}
			</ScrollView>
		</ActionSheet>
	);
}

function Note({ text }: { text: string }) {
	const styles = useStyles();

	return (
		<Discord.Text variant='text-sm/medium' color='text-muted' style={styles.note}>
			{text}
		</Discord.Text>
	);
}

type PermissionGroupsProps = {
	bits: Bits;
	isAllowed: (name: string) => boolean;
	subLabel?: (name: string) => string | undefined;
};

/** Every permission, in Discord's groups, each with a check or a cross. */
function PermissionGroups({ bits, isAllowed, subLabel }: PermissionGroupsProps) {
	return (
		<>
			{categorize(bits, messages.OTHER).map((group) => (
				<Discord.TableRowGroup key={group.name} title={group.name}>
					{group.permissions.map((name) => (
						<Discord.TableRow
							key={name}
							label={permissionLabel(name, bits)}
							subLabel={subLabel?.(name)}
							trailing={<StateIcon allowed={isAllowed(name)} />}
						/>
					))}
				</Discord.TableRowGroup>
			))}
		</>
	);
}

function RoleRows({ roles }: { roles: readonly Role[] }) {
	return (
		<Discord.TableRowGroup title={messages.ROLES_SECTION}>
			{roles.map((role) => (
				<Discord.TableRow key={role.id} label={role.name} subLabel={roleHex(role.color) ?? messages.NO_COLOR} />
			))}
		</Discord.TableRowGroup>
	);
}

function MemberView({ guildId, userId }: { guildId: string; userId: string }) {
	const data = memberData(guildId, userId);

	if (!data) {
		return (
			<Frame title={messages.PERMISSIONS}>
				<Note text={messages.NOT_IN_SERVER} />
			</Frame>
		);
	}

	return (
		<Frame title={format('MEMBER_TITLE', { name: data.name })}>
			{data.isOwner ? <Note text={messages.OWNER} /> : null}
			{data.isAdmin ? <Note text={messages.ADMIN} /> : null}
			{data.roles.length ? <RoleRows roles={data.roles} /> : null}
			<PermissionGroups
				bits={data.bits}
				isAllowed={data.has}
				subLabel={(name) => {
					const role = data.has(name) && !data.isOwner ? data.grantedBy(name) : undefined;

					return role ? format('GRANTED_BY', { role: role.name }) : undefined;
				}}
			/>
		</Frame>
	);
}

function GuildView({ guildId }: { guildId: string }) {
	const [selected, setSelected] = useState<string | null>(null);
	const roles = guildRoles(guildId);
	const role = roles.find((entry) => entry.id === selected);

	if (role) {
		const bits = permissionBits();

		return (
			<Frame title={format('ROLE_TITLE', { name: role.name })} onBack={() => setSelected(null)}>
				<PermissionGroups bits={bits} isAllowed={(name) => has(toBigInt(role.permissions), bits[name])} />
			</Frame>
		);
	}

	return (
		<Frame title={messages.ROLES}>
			<Discord.TableRowGroup>
				{roles.map((entry) => (
					<Discord.TableRow
						key={entry.id}
						label={entry.name}
						subLabel={roleHex(entry.color) ?? messages.NO_COLOR}
						arrow
						onPress={() => setSelected(entry.id)}
					/>
				))}
			</Discord.TableRowGroup>
		</Frame>
	);
}

function OverwriteGroup({ entry, bits }: { entry: OverwriteEntry; bits: Bits }) {
	return (
		<Discord.TableRowGroup title={entry.name}>
			{entry.allowed.length === 0 && entry.denied.length === 0 ? (
				<Discord.TableRow label={messages.NO_CHANGES} />
			) : null}
			{entry.allowed.map((name) => (
				<Discord.TableRow key={`a-${name}`} label={permissionLabel(name, bits)} trailing={<StateIcon allowed />} />
			))}
			{entry.denied.map((name) => (
				<Discord.TableRow
					key={`d-${name}`}
					label={permissionLabel(name, bits)}
					trailing={<StateIcon allowed={false} />}
				/>
			))}
		</Discord.TableRowGroup>
	);
}

function ChannelView({ channelId }: { channelId: string }) {
	const data = channelData(channelId);

	if (!data) {
		return (
			<Frame title={messages.PERMISSIONS}>
				<Note text={messages.NOT_IN_SERVER} />
			</Frame>
		);
	}

	const empty = data.roles.length === 0 && data.members.length === 0;

	return (
		<Frame title={format('CHANNEL_TITLE', { name: data.name })}>
			{empty ? <Note text={messages.NO_OVERWRITES} /> : null}
			{data.roles.length ? <Section title={messages.ROLES_SECTION} entries={data.roles} bits={data.bits} /> : null}
			{data.members.length ? <Section title={messages.MEMBERS_SECTION} entries={data.members} bits={data.bits} /> : null}
		</Frame>
	);
}

function Section({ title, entries, bits }: { title: string; entries: OverwriteEntry[]; bits: Bits }) {
	return (
		<>
			<Discord.Text variant='text-sm/semibold' color='text-muted' style={{ paddingHorizontal: 16 }}>
				{title}
			</Discord.Text>
			{entries.map((entry) => (
				<OverwriteGroup key={entry.id} entry={entry} bits={bits} />
			))}
		</>
	);
}

/**
 * @description The permissions sheet: a server's roles and what each allows, a channel's overwrites,
 * or the permissions a member has from their roles.
 * @param props What to show.
 * @returns The sheet.
 */
function PermissionsSheet({ target }: SheetProps) {
	if (target.kind === 'member') return <MemberView guildId={target.guildId} userId={target.userId} />;

	if (target.kind === 'guild') return <GuildView guildId={target.guildId} />;

	return <ChannelView channelId={target.channelId} />;
}

export default PermissionsSheet;
