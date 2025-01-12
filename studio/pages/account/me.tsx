import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { IconArrowRight, IconMoon, IconSun, Input, Listbox } from 'ui'

import { Session } from '@supabase/supabase-js'
import { AccountLayout } from 'components/layouts'
import SchemaFormPanel from 'components/to-be-cleaned/forms/SchemaFormPanel'
import Panel from 'components/ui/Panel'
import { useProfile, useStore } from 'hooks'
import { post } from 'lib/common/fetch'
import { API_URL } from 'lib/constants'
import { auth } from 'lib/gotrue'
import { NextPageWithLayout } from 'types'
import Link from 'next/link'

const User: NextPageWithLayout = () => {
  return (
    <div className="my-2">
      <ProfileCard />
    </div>
  )
}

User.getLayout = (page) => (
  <AccountLayout
    title="Supabase"
    breadcrumbs={[
      {
        key: `supabase-settings`,
        label: 'Preferences',
      },
    ]}
  >
    {page}
  </AccountLayout>
)

export default User

const ProfileCard = observer(() => {
  const { ui } = useStore()
  const { mutateProfile } = useProfile()
  const user = ui.profile

  const updateUser = async (model: any) => {
    try {
      const updatedUser = await post(`${API_URL}/profile/update`, model)
      mutateProfile(updatedUser, false)
      ui.setProfile(updatedUser)
      ui.setNotification({ category: 'success', message: 'Successfully saved profile' })
    } catch (error) {
      ui.setNotification({
        error,
        category: 'error',
        message: "Couldn't update profile. Please try again later.",
      })
    }
  }

  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    ;(async () => {
      const {
        data: { session },
      } = await auth.getSession()

      if (session) {
        setSession(session)
      }
    })()
  }, [])

  return (
    <article className="max-w-4xl p-4">
      <section>
        <Profile />
      </section>

      {session?.user.app_metadata.provider === 'email' && (
        <section>
          <Panel
            title={
              <h5 key="panel-title" className="mb-0">
                Password
              </h5>
            }
          >
            <Panel.Content>
              <div>
                You can change your password on the{' '}
                <Link href="/reset-password">
                  <a className="text-blue-1000 hover:text-blue-1100 transition">
                    password reset page <IconArrowRight width={16} height={16} className="inline" />
                  </a>
                </Link>
              </div>
            </Panel.Content>
          </Panel>
        </section>
      )}

      <section>
        {/* @ts-ignore */}
        <SchemaFormPanel
          title="Profile"
          schema={{
            type: 'object',
            required: [],
            properties: {
              first_name: { type: 'string' },
              last_name: { type: 'string' },
            },
          }}
          model={{
            first_name: user?.first_name ?? '',
            last_name: user?.last_name ?? '',
          }}
          onSubmit={updateUser}
        />
      </section>

      <section>
        <ThemeSettings />
      </section>
    </article>
  )
})

const Profile = observer(() => {
  const { ui } = useStore()

  return (
    <Panel
      title={
        <h5 key="panel-title" className="mb-0">
          Account Information
        </h5>
      }
    >
      <Panel.Content>
        <div className="space-y-2">
          <Input
            readOnly
            disabled
            label="Username"
            layout="horizontal"
            value={ui.profile?.username ?? ''}
          />
          <Input
            readOnly
            disabled
            label="Email"
            layout="horizontal"
            value={ui.profile?.primary_email ?? ''}
          />
        </div>
      </Panel.Content>
    </Panel>
  )
})

const ThemeSettings = observer(() => {
  const { ui } = useStore()

  return (
    <Panel title={<h5 key="panel-title">Theme</h5>}>
      <Panel.Content>
        <Listbox
          value={ui.themeOption}
          label="Interface theme"
          descriptionText="Choose a theme preference"
          layout="horizontal"
          style={{ width: '50%' }}
          icon={
            ui.themeOption === 'light' ? (
              <IconSun />
            ) : ui.themeOption === 'dark' ? (
              <IconMoon />
            ) : undefined
          }
          onChange={(themeOption: any) => ui.onThemeOptionChange(themeOption)}
        >
          <Listbox.Option label="System default" value="system">
            System default
          </Listbox.Option>
          <Listbox.Option label="Dark" value="dark">
            Dark
          </Listbox.Option>
          <Listbox.Option label="Light" value="light">
            Light
          </Listbox.Option>
        </Listbox>
      </Panel.Content>
    </Panel>
  )
})
